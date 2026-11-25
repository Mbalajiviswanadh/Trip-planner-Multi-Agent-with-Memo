import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check, ChevronDown, Clock, Cpu, ExternalLink, GitBranch, Hotel, CloudSun, MessageCircle, Plane,
  Route, ShieldAlert, Sparkles, UserCheck, Users, Wallet, X, Loader2, Workflow,
} from 'lucide-react'
import { extractLinks, formatClock, formatDuration, useElapsed } from '../lib/format'

const META = {
  supervisor: { label: 'Supervisor', note: 'Reads the request and picks agents', icon: GitBranch },
  flight_agent: { label: 'Flights', note: 'Searches routes and airlines', icon: Plane },
  hotel_agent: { label: 'Hotels', note: 'Finds places to stay', icon: Hotel },
  weather_agent: { label: 'Weather', note: 'Checks the forecast and season', icon: CloudSun },
  budget_agent: { label: 'Budget', note: 'Estimates costs', icon: Wallet },
  itinerary_agent: { label: 'Itinerary', note: 'Writes the draft plan', icon: Route },
  human: { label: 'Your review', note: 'You approve or request changes', icon: UserCheck },
  final: { label: 'Final plan', note: 'Polishes the approved plan', icon: Sparkles },
  chat: { label: 'Chat agent', note: 'Replies conversationally', icon: MessageCircle },
  guardrail: { label: 'Guardrail', note: 'Request is outside travel planning', icon: ShieldAlert },
}

function buildSteps(message, pending) {
  if (!message?.run) return []
  const run = message.run
  const steps = [{ id: 'supervisor', state: 'done' }]
  if (run.intent === 'chat') steps.push({ id: 'chat', state: 'done' })
  else if (run.intent === 'blocked') steps.push({ id: 'guardrail', state: 'done' })
  else {
    run.agents.forEach((a) => steps.push({ id: a, state: 'done' }))
    const waiting = message.kind === 'draft' && message.approval?.state === 'pending'
    const revised = message.approval?.state === 'revised'
    steps.push({
      id: 'human',
      state: waiting ? 'waiting' : 'done',
    })
    steps.push({
      id: 'final',
      state: waiting ? 'idle' : pending ? 'waiting' : 'done',
    })
  }
  return steps
}

function StateDot({ state }) {
  if (state === 'done')
    return (
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-fg">
        <Check size={13} strokeWidth={3} />
      </span>
    )
  if (state === 'waiting')
    return (
      <span className="relative flex h-6 w-6 items-center justify-center">
        <span className="absolute h-6 w-6 animate-ping rounded-full bg-accent/30 motion-reduce:animate-none" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
      </span>
    )
  return <span className="h-6 w-6 rounded-full border border-line" />
}

const SECTIONS = [
  ['flights', 'Flights'],
  ['hotels', 'Hotels'],
  ['weather', 'Weather'],
  ['budget', 'Budget'],
]

function Resource({ label, text }) {
  const [open, setOpen] = useState(false)
  const links = extractLinks(text)
  const body = text.length > 1400 ? `${text.slice(0, 1400)}…` : text
  return (
    <li className="rounded-xl border border-line">
      <button className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-semibold" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>{label}{links.length > 0 && <span className="ml-2 text-xs font-normal text-muted">{links.length} link{links.length > 1 ? 's' : ''}</span>}</span>
        <ChevronDown size={16} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="space-y-3 border-t border-line px-3 py-3">
              {links.length > 0 && (
                <ul className="space-y-1.5">
                  {links.map((l) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 truncate text-xs text-accent hover:underline">
                        <ExternalLink size={12} className="shrink-0" /> <span className="truncate">{l.host}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-muted">{body}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  )
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-sunken p-3">
      <Icon size={14} className="text-muted" />
      <p className="mt-2 text-lg font-semibold tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  )
}

function RunDetails({ message, pending }) {
  const run = message.run
  const steps = buildSteps(message, pending)
  const constraints = Object.entries(run.constraints || {})
    .map(([k, v]) => [k.replace(/_/g, ' '), Array.isArray(v) ? v.join(', ') : v])
    .filter(([, v]) => v)
  const resources = SECTIONS.filter(([k]) => run.results[k])

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={Cpu} label="LLM calls" value={run.llmCalls} />
        <Stat icon={Clock} label="Time taken" value={formatDuration(run.elapsedMs)} />
        <Stat icon={Users} label="Agents" value={steps.filter((s) => !['human', 'final'].includes(s.id)).length} />
      </div>
      <p className="-mt-4 text-xs text-muted">Invoked at {formatClock(run.startedAt)}</p>

      <ol key={message.id} className="space-y-1">
        {steps.map((s, i) => {
          const m = META[s.id]
          const Icon = m.icon
          return (
            <motion.li key={s.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, duration: 0.25 }} className="relative flex gap-3 pb-3">
              {i < steps.length - 1 && <span className="absolute left-3 top-6 h-full w-px bg-line" aria-hidden="true" />}
              <StateDot state={s.state} />
              <div className="min-w-0 pt-0.5">
                <p className="flex items-center gap-2 text-sm font-semibold"><Icon size={14} className="text-muted" /> {m.label}</p>
                <p className="text-xs text-muted">{s.state === 'waiting' ? 'Waiting for you' : m.note}</p>
              </div>
            </motion.li>
          )
        })}
      </ol>

      {run.reasoning && (
        <div>
          <h3 className="text-xs font-semibold text-muted">Why these agents</h3>
          <p className="mt-2 text-sm leading-relaxed">{run.reasoning}</p>
        </div>
      )}

      {constraints.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted">Understood from your request</h3>
          <dl className="mt-2 flex flex-wrap gap-2">
            {constraints.map(([k, v]) => (
              <div key={k} className="rounded-lg bg-accent-soft px-2.5 py-1 text-xs"><dt className="inline text-muted">{k}: </dt><dd className="inline font-semibold">{String(v)}</dd></div>
            ))}
          </dl>
        </div>
      )}

      {resources.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-muted">Resources used</h3>
          <ul className="mt-2 space-y-2">
            {resources.map(([k, label]) => <Resource key={k} label={label} text={run.results[k]} />)}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function FlowPanel({ message, pending, onClose }) {
  const elapsed = useElapsed(pending?.startedAt)
  return (
    <div className="flex h-full w-full flex-col bg-surface">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Workflow size={16} className="text-muted" /> Agent flow</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close agent flow"><X size={18} /></button>
      </header>
      <div className="flex-1 overflow-y-auto p-5">
        {pending && (
          <div className="mb-6 rounded-xl border border-line p-4">
            <p className="flex items-center gap-2 text-sm font-semibold"><Loader2 size={15} className="animate-spin" /> Agents are running</p>
            <p className="mt-1 text-xs text-muted">{formatDuration(elapsed)} elapsed. Per-agent progress appears when the run finishes.</p>
          </div>
        )}
        {message?.run ? (
          <RunDetails message={message} pending={pending} />
        ) : (
          !pending && <p className="text-sm text-muted">Send a trip request to see which agents ran, how many model calls it took, and the sources they used.</p>
        )}
      </div>
    </div>
  )
}
