export default function Logo({ size = 28, withText = true }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="9" className="fill-accent" />
        <path d="M9 21c3-8 6-8 7-5s4 2 7-6" fill="none" strokeWidth="2.4" strokeLinecap="round" className="stroke-accent-fg" />
        <circle cx="9" cy="21" r="2" className="fill-accent-fg" />
        <circle cx="23" cy="10" r="2" className="fill-accent-fg" />
      </svg>
      {withText && <span className="font-display text-2xl leading-none tracking-tight">TripMate</span>}
    </span>
  )
}
