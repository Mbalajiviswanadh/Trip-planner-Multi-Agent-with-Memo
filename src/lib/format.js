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

export function formatThreadDate(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfItem = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((startOfToday - startOfItem) / 864e5)

  if (diffDays === 0) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' })
  if (d.getFullYear() === now.getFullYear()) return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

export function groupThreads(items) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const buckets = new Map()

  const add = (label, item) => {
    if (!buckets.has(label)) buckets.set(label, [])
    buckets.get(label).push(item)
  }

  items.forEach((t) => {
    const d = new Date(t.updated_at || t.created_at)
    if (Number.isNaN(d.getTime())) {
      add('Older', t)
      return
    }
    const startOfItem = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const diffDays = Math.round((startOfToday - startOfItem) / 864e5)

    if (diffDays <= 0) add('Today', t)
    else if (diffDays === 1) add('Yesterday', t)
    else if (diffDays < 7) add('Previous 7 days', t)
    else if (diffDays < 30) add('Previous 30 days', t)
    else add(d.toLocaleDateString([], { month: 'long', year: 'numeric' }), t)
  })

  return Array.from(buckets.entries())
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
