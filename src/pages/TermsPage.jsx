import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

export default function TermsPage() {
  return (
    <div className="min-h-full bg-bg text-ink">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-bg/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link to="/" aria-label="TripMate home">
            <Logo size={24} />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="btn btn-ghost text-xs">
              <ArrowLeft size={14} /> Back to home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">Legal</p>
          <h1 className="mt-2 font-display text-4xl">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted">Last updated: November 28, 2026</p>
        </div>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="text-base font-semibold text-ink">1. Acceptance of Terms</h2>
          <p>
            By accessing or using TripMate AI, you agree to be bound by these Terms of Service and our{' '}
            <Link to="/privacy" className="font-medium text-accent hover:underline">Privacy Policy</Link>.
            If you do not agree, please do not use the service.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="text-base font-semibold text-ink">2. Service Description</h2>
          <p>
            TripMate AI is a multi-agent travel planning assistant that researches destinations, flights, weather, and
            budgets, and optionally connects to user-authorized external MCP tools (such as Google Calendar, Google Drive,
            and Notion). Draft itineraries require your review and approval before finalization.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="text-base font-semibold text-ink">3. User Responsibilities</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Travel prices, flight schedules, visa rules, and weather forecasts can change rapidly; always verify official details before booking.</li>
            <li>You are responsible for keeping your account credentials secure and only connecting MCP servers you are authorized to access.</li>
            <li>You agree not to misuse the platform for abusive, unlawful, or automated scraping activities.</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="text-base font-semibold text-ink">4. Third-Party Integrations</h2>
          <p>
            When you authorize third-party services via OAuth or API keys, actions performed through those integrations are
            subject to the respective provider&apos;s terms. You may disconnect any integration at any time.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="text-base font-semibold text-ink">5. Disclaimer &amp; Limitation of Liability</h2>
          <p>
            TripMate AI is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of
            any kind. To the maximum extent permitted by law, TripMate AI shall not be liable for indirect or
            consequential damages arising from travel decisions made using AI-generated plans.
          </p>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted sm:flex-row">
          <span>TripMate AI</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-ink">Privacy Policy</Link>
            <Link to="/terms" className="font-medium text-ink">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
