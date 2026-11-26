import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Logo from './Logo'
import Markdown from './Markdown'
import { formatDuration, useElapsed } from '../lib/format'

function fallbackPhrase(ms) {
  if (ms < 6000) return 'Reading your request'
  if (ms < 60000) return 'Agents are gathering details'
  return 'Still working. Live flight and hotel lookups can take a minute'
}

export default function PendingMessage({ pending }) {
  const startedAt = pending?.startedAt
  const statusText = pending?.statusText
  const streamText = pending?.streamText || ''
  const ms = useElapsed(startedAt)

  // Smooth progressive reveal so fast Groq bursts still render letter-by-letter / word-by-word
  const [shownLen, setShownLen] = useState(0)

  useEffect(() => {
    if (!streamText) {
      setShownLen(0)
      return
    }
    if (shownLen >= streamText.length) return

    const timer = setInterval(() => {
      setShownLen((prev) => {
        if (prev >= streamText.length) return prev
        const remaining = streamText.length - prev
        // Adaptive step: smooth 3-4 chars normally, faster if far behind
        const step = Math.max(3, Math.ceil(remaining / 12))
        return Math.min(streamText.length, prev + step)
      })
    }, 18)

    return () => clearInterval(timer)
  }, [streamText, shownLen])

  const visibleText = streamText.slice(0, shownLen)

  return (
    <div className="flex gap-3" role="status" aria-live="polite">
      <motion.span
        className="mt-1 shrink-0"
        animate={{ opacity: [1, 0.45, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      >
        <Logo size={24} withText={false} />
      </motion.span>
      <div className="min-w-0 flex-1">
        {visibleText ? (
          <div>
            <Markdown>{visibleText}</Markdown>
            <span className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
              Streaming… {formatDuration(ms)}
            </span>
          </div>
        ) : (
          <div className="pt-1 text-sm text-muted">
            {statusText || fallbackPhrase(ms)}
            <span className="ml-1 inline-flex gap-0.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                >
                  .
                </motion.span>
              ))}
            </span>
            <span className="ml-2 text-xs tabular-nums">{formatDuration(ms)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
