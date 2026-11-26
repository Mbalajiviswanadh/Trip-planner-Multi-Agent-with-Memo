const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

let getToken = () => null
let handleUnauthorized = () => {}

export function configureApi({ getToken: g, onUnauthorized: u }) {
  if (g) getToken = g
  if (u) handleUnauthorized = u
}

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const FALLBACK = {
  400: 'That request was not valid.',
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have access to that.",
  404: 'We could not find that.',
  409: 'That already exists.',
  422: 'Some details are invalid.',
  429: 'Too many requests. Try again in a moment.',
}

function extractMessage(data, status) {
  let msg = ''
  if (data) {
    if (typeof data.detail === 'string') msg = data.detail
    else if (Array.isArray(data.detail))
      msg = data.detail
        .map((d) => `${(d.loc || []).slice(1).join('.') || 'field'}: ${d.msg}`)
        .join('\n')
    else if (typeof data.error === 'string') msg = data.error
    else if (typeof data.message === 'string') msg = data.message
  }
  if (!msg) msg = FALLBACK[status] || (status >= 500 ? 'The server hit a problem. Please try again.' : 'Something went wrong.')
  return msg.length > 400 ? `${msg.slice(0, 400)}…` : msg
}

async function request(path, { method = 'GET', body, timeout = 30000, auth = true } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timer)
    if (err?.name === 'AbortError') throw new ApiError('This is taking longer than expected. Please try again.')
    throw new ApiError("Can't reach the server. Check your connection and that the API is running.")
  }
  clearTimeout(timer)

  let data = null
  try {
    const text = await res.text()
    data = text ? JSON.parse(text) : null
  } catch {
    data = null
  }

  if (!res.ok) {
    if (res.status === 401 && token) handleUnauthorized()
    throw new ApiError(extractMessage(data, res.status), res.status, data)
  }
  return data
}

const LONG = 300000 // multi-agent runs can take a few minutes

async function streamRequest(path, body, { onEvent, timeout = LONG } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  const headers = { Accept: 'text/event-stream', 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timer)
    if (err?.name === 'AbortError') throw new ApiError('This is taking longer than expected. Please try again.')
    throw new ApiError("Can't reach the server. Check your connection and that the API is running.")
  }

  if (!res.ok) {
    clearTimeout(timer)
    let data = null
    try {
      const text = await res.text()
      data = text ? JSON.parse(text) : null
    } catch { data = null }
    if (res.status === 401 && token) handleUnauthorized()
    throw new ApiError(extractMessage(data, res.status), res.status, data)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let finalResult = null

  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // Split SSE frames separated by double newline (\n\n or \r\n\r\n)
      const frames = buffer.split(/\r?\n\r?\n/)
      buffer = frames.pop() || ''

      for (const frame of frames) {
        if (!frame.trim()) continue
        let eventName = 'message'
        const dataLines = []
        for (const line of frame.split(/\r?\n/)) {
          if (line.startsWith('event:')) eventName = line.slice(6).trim()
          else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
        }
        if (!dataLines.length) continue
        let payload
        try {
          payload = JSON.parse(dataLines.join('\n'))
        } catch {
          continue
        }
        if (eventName === 'error') {
          throw new ApiError(payload?.message || 'Streaming error occurred.')
        }
        if (eventName === 'result') {
          finalResult = payload
        }
        if (onEvent) onEvent(eventName, payload)
      }
    }
  } finally {
    clearTimeout(timer)
  }

  if (!finalResult) {
    throw new ApiError('Stream ended before a final response was received.')
  }
  return finalResult
}

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body, auth: false }),
  login: (body) => request('/api/auth/login', { method: 'POST', body, auth: false }),
  me: () => request('/api/auth/me'),
  listThreads: () => request('/api/threads'),
  createThread: (title) => request('/api/threads', { method: 'POST', body: { title } }),
  deleteThread: (id) => request(`/api/threads/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  travel: (body) => request('/api/travel', { method: 'POST', body, timeout: LONG }),
  travelStream: (body, opts) => streamRequest('/api/travel/stream', body, opts),
  approve: (body) => request('/api/travel/approve', { method: 'POST', body, timeout: LONG }),
  history: (id, page = 1, limit = 20) =>
    request(`/api/history/${encodeURIComponent(id)}?page=${page}&limit=${limit}`),
}
