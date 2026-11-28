import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  CloudSun,
  GitBranch,
  Hotel,
  PencilLine,
  Plane,
  Plug,
  Route,
  Sparkles,
  Wallet,
} from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

const AGENTS = [
  {
    icon: GitBranch,
    name: 'Supervisor',
    desc: 'Reads your request, extracts constraints, and routes work to the right specialists.',
  },
  {
    icon: Plane,
    name: 'Flights',
    desc: 'Compares routes, timings, and airlines that fit your schedule.',
  },
  {
    icon: Hotel,
    name: 'Hotels',
    desc: 'Finds stays matched to your neighborhood, style, and nightly budget.',
  },
  {
    icon: CloudSun,
    name: 'Weather',
    desc: 'Checks seasonal forecasts so your itinerary suits the conditions.',
  },
  {
    icon: Wallet,
    name: 'Budget',
    desc: 'Estimates total trip costs across transport, lodging, and daily spend.',
  },
  {
    icon: Plug,
    name: 'Connected MCPs',
    desc: 'Brings in your own external tools and context when you connect them.',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Describe your trip in plain words',
    body: 'Share your dates, origin, budget, or dietary preferences—no rigid forms or filters.',
  },
  {
    num: '02',
    title: 'Specialists research in parallel',
    body: 'A supervisor coordinates flight, hotel, weather, and budget agents and synthesizes a draft.',
  },
  {
    num: '03',
    title: 'Review before anything is final',
    body: 'Approve the draft as-is or request targeted changes until the itinerary feels right.',
  },
]

const PREVIEW_AGENTS = [
  { icon: GitBranch, label: 'Supervisor' },
  { icon: Plane, label: 'Flights' },
  { icon: Hotel, label: 'Hotels' },
  { icon: CloudSun, label: 'Weather' },
  { icon: Wallet, label: 'Budget' },
  { icon: Route, label: 'Itinerary' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

export default function LandingPage() {
  const token = useSelector((s) => s.auth.token)

  return (
    <div className="min-h-full bg-bg text-ink">
      {/* Navigation */}
      <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link to="/" aria-label="TripMate home">
            <Logo size={26} />
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-muted sm:flex" aria-label="Primary">
            <a href="#how-it-works" className="transition-colors hover:text-ink">How it works</a>
            <a href="#agents" className="transition-colors hover:text-ink">Agents</a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {token ? (
              <Link to="/chat" className="btn btn-primary">
                Open app <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link to="/auth" className="btn btn-ghost hidden sm:inline-flex">
                  Sign in
                </Link>
                <Link to="/auth?mode=register" className="btn btn-primary">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pb-20 pt-16 sm:pt-24">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.p
              variants={fadeUp}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1 text-xs font-medium text-muted"
            >
              <Sparkles size={13} className="text-accent" />
              Multi-agent travel planning
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="mt-6 font-display text-5xl leading-[1.04] tracking-tight sm:text-6xl"
            >
              Describe a trip.{' '}
              <span className="italic text-accent">Approve</span> the plan.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted"
            >
              A coordinated team of specialist agents researches flights, stays, weather, and budget—then pauses for your review before anything is final.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              {token ? (
                <Link to="/chat" className="btn btn-primary px-5 py-3">
                  Back to your trips <ArrowRight size={16} />
                </Link>
              ) : (
                <>
                  <Link to="/auth?mode=register" className="btn btn-primary px-5 py-3">
                    Start planning <ArrowRight size={16} />
                  </Link>
                  <Link to="/auth" className="btn btn-outline px-5 py-3">
                    Sign in
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>

          {/* Quiet Product Preview */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-14 max-w-3xl rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-7"
          >
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2.5">
                <Logo size={20} withText={false} />
                <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                  Trip Draft · Goa
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Awaiting your review
              </span>
            </div>

            <div className="mt-5 space-y-5">
              {/* User prompt bubble */}
              <div className="flex justify-end">
                <p className="max-w-md rounded-2xl rounded-br-sm bg-sunken px-4 py-2.5 text-sm text-ink">
                  Plan a 4-day budget trip from Hyderabad to Goa in December, vegetarian food, quiet beach stay.
                </p>
              </div>

              {/* Agent trace pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                {PREVIEW_AGENTS.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-bg px-2.5 py-1 text-xs text-muted"
                  >
                    <Icon size={12} className="text-accent" />
                    {label}
                  </span>
                ))}
              </div>

              {/* Draft summary + Human-in-the-loop card */}
              <div className="rounded-xl border border-line bg-bg p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-display text-xl">4 Days in South Goa</p>
                  <p className="text-xs font-medium text-muted">Est. ₹18,400 · Dec 12–15</p>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  Morning HYD → GOI flight, 3 nights near Palolem, coastal vegetarian dining spots, and a buffer for scooter rental.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-fg">
                    <Check size={13} /> Approve plan
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink">
                    <PencilLine size={13} /> Request changes
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-line bg-surface/60">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">How it works</p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                Built around your approval, not guesswork.
              </h2>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.num} className="border-t border-line pt-5">
                  <span className="font-display text-2xl text-accent">{step.num}</span>
                  <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specialist Agents */}
        <section id="agents" className="border-t border-line">
          <div className="mx-auto max-w-5xl px-6 py-20">
            <div className="max-w-lg">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">The team</p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl">
                Six focused agents, one clear itinerary.
              </h2>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {AGENTS.map(({ icon: Icon, name, desc }) => (
                <div
                  key={name}
                  className="rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-accent/50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold">{name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-line bg-surface/60">
          <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center">
            <h2 className="max-w-md font-display text-4xl leading-tight sm:text-5xl">
              Where to next?
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted">
              Create a free account to save your trips, inspect every agent’s sources, and keep your preferences across conversations.
            </p>
            <Link to={token ? '/chat' : '/auth?mode=register'} className="btn btn-primary mt-7 px-6 py-3">
              {token ? 'Open TripMate' : 'Plan your first trip'} <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 py-8 text-xs text-muted sm:flex-row">
          <Logo size={20} />
          <div className="flex flex-wrap items-center gap-4">
            <span>Multi-agent trip planning with human-in-the-loop approval.</span>
            <Link to="/privacy" className="font-medium hover:text-ink hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="font-medium hover:text-ink hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
