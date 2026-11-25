import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'

const SUGGESTIONS = [
  'Plan a 4-day budget trip from Hyderabad to Goa in December',
  'Weekend in Jaipur for two, mid-range hotels, vegetarian food',
  'Best time to visit Kerala and what it costs for 5 days',
  'Flights and hotels from Visakhapatnam to Bangalore next month',
]

export default function EmptyState({ onPick, disabled }) {
  const name = useSelector((s) => s.auth.user?.name || '').split(' ')[0]
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center px-4 pb-10 text-center">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="font-display text-4xl sm:text-5xl">
        Where to next{name ? `, ${name}` : ''}?
      </motion.h1>
      <p className="mt-3 max-w-md text-sm text-muted">Describe the trip in your own words. Agents handle flights, hotels, weather and budget, then you approve the plan.</p>
      <ul className="mt-8 grid w-full gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <li key={s}>
            <button
              disabled={disabled}
              onClick={() => onPick(s)}
              className="h-full w-full rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm text-ink transition-colors hover:border-accent hover:bg-accent-soft disabled:opacity-50"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
