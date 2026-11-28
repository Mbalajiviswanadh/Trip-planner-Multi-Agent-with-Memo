import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { AlertCircle, Brain, Eye, EyeOff, Loader2, Plug, ShieldCheck, Sparkles } from 'lucide-react'
import Logo from '../components/Logo'
import ThemeToggle from '../components/ThemeToggle'
import { clearAuthError, login, register } from '../store/authSlice'

const EMAIL = /^[\w.+-]+@[A-Za-z0-9-]+\.[A-Za-z0-9-.]+$/

const STAGES = [
  '4-Intent LLM Router & Guardrails',
  'Flight, Hotel, Weather & Budget agents',
  'Dynamic MCPs (Drive, Calendar, Notion)',
  '5-Tier Memory & On-Demand pgvector',
  'Itinerary draft → You approve',
]

const CAPABILITIES = [
  {
    icon: Plug,
    title: 'Dynamic MCP Integrations',
    desc: 'Connect Google Drive, Calendar, Notion, or custom MCPs with 3-Stage Tool RAG.',
  },
  {
    icon: Brain,
    title: '5-Tier Hybrid Memory',
    desc: 'Mem0 + Qdrant user facts and on-demand pgvector past-trip recall.',
  },
  {
    icon: ShieldCheck,
    title: 'Guardrails & HITL',
    desc: 'Input/output safety checks plus human review before any plan is final.',
  },
  {
    icon: Sparkles,
    title: 'Live Execution Trace',
    desc: 'Watch real-time agent steps, memory tiers, and MCP tool filters stream live.',
  },
]

const MCP_BADGES = ['Tavily', 'AviationStack', 'Weather MCP', 'Google Calendar', 'Google Drive', 'Notion', 'Custom MCP']

function Pipeline() {
  return (
    <motion.ol initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }} className="mt-4 space-y-0">
      {STAGES.map((s, i) => (
        <motion.li key={s} variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } }} className="relative flex items-center gap-3 pb-2.5 last:pb-0">
          {i < STAGES.length - 1 && <span className="absolute left-[5px] top-3 h-full w-px bg-line" aria-hidden="true" />}
          <span className={`relative z-10 h-[11px] w-[11px] shrink-0 rounded-full ${i === STAGES.length - 1 ? 'bg-accent' : 'border-2 border-accent bg-bg'}`} />
          <span className={`text-xs xl:text-sm ${i === STAGES.length - 1 ? 'font-semibold text-ink' : 'text-muted'}`}>{s}</span>
        </motion.li>
      ))}
    </motion.ol>
  )
}

function Field({ label, error, children, id }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{label}</label>
      {children}
      {error && <p id={`${id}-err`} className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  )
}

export default function AuthPage() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const { status, error } = useSelector((s) => s.auth)
  const [mode, setMode] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login')

  useEffect(() => {
    setMode(searchParams.get('mode') === 'register' ? 'register' : 'login')
  }, [searchParams])
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errs, setErrs] = useState({})
  const [show, setShow] = useState(false)
  const isRegister = mode === 'register'
  const loading = status === 'loading'

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    if (errs[k]) setErrs((x) => ({ ...x, [k]: undefined }))
  }

  const switchMode = () => {
    setMode(isRegister ? 'login' : 'register')
    setErrs({})
    dispatch(clearAuthError())
  }

  const submit = (e) => {
    e.preventDefault()
    const v = {}
    if (isRegister && form.name.trim().length < 2) v.name = 'Enter your full name.'
    if (!EMAIL.test(form.email.trim())) v.email = 'Enter a valid email address.'
    if (form.password.length < 6) v.password = 'Use at least 6 characters.'
    setErrs(v)
    if (Object.keys(v).length) return
    const email = form.email.trim().toLowerCase()
    dispatch(isRegister ? register({ name: form.name.trim(), email, password: form.password }) : login({ email, password: form.password }))
  }

  return (
    <div className="grid min-h-full lg:h-dvh lg:overflow-hidden lg:grid-cols-2">
      <aside className="hidden flex-col justify-between gap-4 border-r border-line bg-surface p-7 xl:p-9 lg:flex">
        <Link to="/" aria-label="TripMate home" className="w-fit shrink-0"><Logo /></Link>

        <div className="space-y-4">
          <div>
            <h1 className="max-w-md font-display text-3xl xl:text-4xl leading-[1.08]">Describe a trip. Approve the plan.</h1>
            <p className="mt-2 max-w-md text-xs xl:text-sm text-muted">
              A multi-agent travel workspace with live MCP integrations, 5-tier memory, and human-in-the-loop approval.
            </p>
            <Pipeline />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {CAPABILITIES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-line bg-bg/70 p-2.5 xl:p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <Icon size={13} className="shrink-0 text-accent" />
                  <span>{title}</span>
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5 border-t border-line pt-3 shrink-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Connected &amp; Supported MCP Tools</p>
          <div className="flex flex-wrap gap-1.5">
            {MCP_BADGES.map((name) => (
              <span key={name} className="rounded-full border border-line bg-bg px-2 py-0.5 text-[11px] font-medium text-muted">
                {name}
              </span>
            ))}
          </div>
        </div>
      </aside>

      <main className="relative flex items-center justify-center px-6 py-12">
        <div className="absolute right-4 top-4"><ThemeToggle /></div>
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><Link to="/" aria-label="TripMate home" className="inline-block"><Logo /></Link></div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <h2 className="font-display text-4xl">{isRegister ? 'Create your account' : 'Welcome back'}</h2>
              <p className="mt-2 text-sm text-muted">{isRegister ? 'Save your trips and let TripMate learn what you like.' : 'Sign in to pick up where you left off.'}</p>

              <form onSubmit={submit} noValidate className="mt-8 space-y-4">
                {isRegister && (
                  <Field id="name" label="Full name" error={errs.name}>
                    <input id="name" className="input" autoComplete="name" value={form.name} onChange={set('name')} aria-invalid={!!errs.name} aria-describedby={errs.name ? 'name-err' : undefined} />
                  </Field>
                )}
                <Field id="email" label="Email" error={errs.email}>
                  <input id="email" type="email" className="input" autoComplete="email" value={form.email} onChange={set('email')} aria-invalid={!!errs.email} aria-describedby={errs.email ? 'email-err' : undefined} />
                </Field>
                <Field id="password" label="Password" error={errs.password}>
                  <div className="relative">
                    <input id="password" type={show ? 'text' : 'password'} className="input pr-11" autoComplete={isRegister ? 'new-password' : 'current-password'} value={form.password} onChange={set('password')} aria-invalid={!!errs.password} aria-describedby={errs.password ? 'password-err' : undefined} />
                    <button type="button" className="icon-btn absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>

                {error && (
                  <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /> <span className="whitespace-pre-wrap">{error}</span>
                  </p>
                )}

                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {isRegister ? 'Create account' : 'Sign in'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                {isRegister ? 'Already have an account?' : 'New to TripMate?'}{' '}
                <button type="button" onClick={switchMode} className="font-semibold text-accent hover:underline">
                  {isRegister ? 'Sign in' : 'Create an account'}
                </button>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
