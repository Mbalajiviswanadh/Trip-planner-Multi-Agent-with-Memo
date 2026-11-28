import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'

export default function PrivacyPage() {
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
          <h1 className="mt-2 font-display text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted">Last updated: November 28, 2026</p>
        </div>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="text-base font-semibold text-ink">1. Information We Collect</h2>
          <p>
            When you create a TripMate AI account, we collect your name, email address, and a securely hashed password.
            When you plan trips, we store your conversation threads, trip constraints, and generated itineraries so you
            can resume conversations and recall past trips.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="text-base font-semibold text-ink">2. Connected Integrations &amp; Google User Data</h2>
          <p>
            If you choose to connect external MCP integrations (such as Google Calendar, Google Drive, Notion, or custom
            remote MCP servers), TripMate AI requests only the permissions required to perform the actions you ask for
            (for example, reading upcoming events, creating a calendar event, or searching Drive files).
          </p>
          <p>
            TripMate AI&apos;s use and transfer of information received from Google APIs adheres to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-accent hover:underline"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements. We never sell your personal data or use Google Workspace data to
            train generalized AI models.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="text-base font-semibold text-ink">3. How We Store &amp; Protect Your Data</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Passwords are hashed using one-way cryptographic hashing.</li>
            <li>OAuth tokens and API keys for connected MCP servers are encrypted at rest using Fernet (AES-128-CBC + HMAC-SHA256).</li>
            <li>All traffic between your browser and TripMate AI is encrypted in transit over HTTPS.</li>
            <li>Memory and vector embeddings are isolated per authenticated user ID.</li>
          </ul>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="text-base font-semibold text-ink">4. Your Controls &amp; Data Deletion</h2>
          <p>
            You can rename or delete conversation threads at any time from the sidebar, and you can pause or disconnect
            any MCP integration (revoking stored credentials) from the MCP Integrations modal.
          </p>
        </section>

        <section className="space-y-3 text-sm leading-relaxed text-muted">
          <h2 className="text-base font-semibold text-ink">5. Contact</h2>
          <p>
            For privacy questions or data deletion requests, please contact the TripMate AI team at{' '}
            <a href="mailto:balajiviswanadh04@gmail.com" className="font-medium text-accent hover:underline">
              balajiviswanadh04@gmail.com
            </a>.
          </p>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted sm:flex-row">
          <span>TripMate AI</span>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="font-medium text-ink">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-ink">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
