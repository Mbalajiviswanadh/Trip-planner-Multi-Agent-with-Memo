import { motion } from 'framer-motion'
import Logo from './Logo'
import { formatDuration, useElapsed } from '../lib/format'

function phrase(ms) {
  if (ms < 6000) return 'Reading your request'
  if (ms < 60000) return 'Agents are gathering details'
  return 'Still working. Live flight and hotel lookups can take a minute'
}

export default function PendingMessage({ startedAt }) {
  const ms = useElapsed(startedAt)
  return (
    <div className="flex gap-3" role="status" aria-live="polite">
      <motion.span className="mt-1 shrink-0" animate={{ opacity: [1, 0.45, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
        <Logo size={24} withText={false} />
      </motion.span>
      <div className="pt-1 text-sm text-muted">
        {phrase(ms)}
        <span className="ml-1 inline-flex gap-0.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}>.</motion.span>
          ))}
        </span>
        <span className="ml-2 text-xs tabular-nums">{formatDuration(ms)}</span>
      </div>
    </div>
  )
}
