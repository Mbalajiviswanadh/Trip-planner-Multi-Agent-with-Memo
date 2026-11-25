import { useEffect, useState } from 'react'

export function formatDuration(ms) {
  if (ms == null) return '—'
  const s = ms / 1000
  if (s < 60) return `${s.toFixed(1)}s`
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
}

export function formatClock(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase()
}

export function groupThreads(items) {
  const now = Date.now()
  const day = 864e5
  const groups = { Today: [], 'Previous 7 days': [], Older: [] }
  items.forEach((t) => {
    const age = now - new Date(t.updated_at || t.created_at).getTime()
    ;(age < day ? groups.Today : age < 7 * day ? groups['Previous 7 days'] : groups.Older).push(t)
  })
  return Object.entries(groups).filter(([, v]) => v.length)
}

const URL_RE = /https?:\/\/[^\s)\]>"'<]+/g

export function extractLinks(text = '') {
  const seen = new Set()
  const out = []
  for (const raw of String(text).match(URL_RE) || []) {
    const url = raw.replace(/[.,;]+$/, '')
    if (seen.has(url)) continue
    seen.add(url)
    try {
      out.push({ url, host: new URL(url).hostname.replace(/^www\./, '') })
    } catch { /* ignore malformed */ }
  }
  return out
}

export function useElapsed(startedAt) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!startedAt) return undefined
    setNow(Date.now())
    const i = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(i)
  }, [startedAt])
  return startedAt ? Math.max(0, now - startedAt) : 0
}

export function useMedia(query) {
  const get = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false)
  const [match, setMatch] = useState(get)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}
