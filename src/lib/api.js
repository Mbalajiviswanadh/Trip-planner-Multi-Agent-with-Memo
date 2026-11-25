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

export const api = {
  register: (body) => request('/api/auth/register', { method: 'POST', body, auth: false }),
  login: (body) => request('/api/auth/login', { method: 'POST', body, auth: false }),
  me: () => request('/api/auth/me'),
  listThreads: () => request('/api/threads'),
  createThread: (title) => request('/api/threads', { method: 'POST', body: { title } }),
  deleteThread: (id) => request(`/api/threads/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  travel: (body) => request('/api/travel', { method: 'POST', body, timeout: LONG }),
  approve: (body) => request('/api/travel/approve', { method: 'POST', body, timeout: LONG }),
  history: (id, page = 1, limit = 20) =>
    request(`/api/history/${encodeURIComponent(id)}?page=${page}&limit=${limit}`),
}
