/**
 * MemoryPanel.jsx
 * ─────────────────────────────────────────────────────────────────
 * Visualises the 4-tier memory strategy the agent used for each
 * message turn, displayed inside the right-hand side panel under
 * the "Chat Memory" tab.
 *
 * Shows:
 *   • Which memory strategy was chosen (Fresh / Chat Recall /
 *     Coreference / Constraint Reuse)
 *   • Sliding window size (how many past messages the LLM "sees")
 *   • Per-tier LLM call count (Tier 2 and Tier 3 cost LLM calls)
 *   • Constraint inheritance (destination, origin, budget etc.)
 *   • Rolling summary (triggered or not, preview)
 *   • Mem0 & vector-DB hit counts
 *   • Original vs resolved query comparison
 */
import { motion } from 'framer-motion'
import {
  ArrowRightLeft, BookOpen, Brain, ChevronDown, ChevronRight,
  Database, History, MessageSquare, RefreshCw, Sparkles,
  Wind, Zap, BrainCircuit, FlameKindling, Minus,
} from 'lucide-react'
import { useState } from 'react'

// ─── Strategy metadata ────────────────────────────────────────────
const STRATEGY_META = {
  fresh: {
    label: 'Fresh Start',
    color: 'bg-blue-500/15 text-blue-500 border-blue-500/25',
    dot: 'bg-blue-500',
    icon: Sparkles,
    desc: 'First message in this thread. No prior history to load.',
  },
  chat_recall: {
    label: 'Chat Recall',
    color: 'bg-violet-500/15 text-violet-500 border-violet-500/25',
    dot: 'bg-violet-500',
    icon: MessageSquare,
    desc: 'Conversational follow-up. Sliding window of recent messages passed to LLM.',
  },
  coreference: {
    label: 'Coreference Resolved',
    color: 'bg-amber-500/15 text-amber-600 border-amber-500/25',
    dot: 'bg-amber-500',
    icon: ArrowRightLeft,
    desc: 'Pronoun or relative reference ("there", "that hotel") was resolved using conversation context.',
  },
  constraint_reuse: {
    label: 'Constraint Inherited',
    color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/25',
    dot: 'bg-emerald-500',
    icon: RefreshCw,
    desc: 'Trip constraints from prior turns (destination, budget, origin) were reused automatically.',
  },
}

// ─── LLM call pill ────────────────────────────────────────────────
function LlmBadge({ calls, note }) {
  if (calls === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-line bg-sunken px-2 py-0.5 text-[10px] font-semibold text-muted">
        <Minus size={9} />
        0 LLM calls
      </span>
    )
  }
  return (
    <span
      title={note || `${calls} LLM call${calls !== 1 ? 's' : ''}`}
      className="inline-flex items-center gap-1 rounded-full border border-orange-400/30 bg-orange-400/10 px-2 py-0.5 text-[10px] font-semibold text-orange-500"
    >
      <FlameKindling size={9} />
      {calls} LLM call{calls !== 1 ? 's' : ''}
    </span>
  )
}

// ─── Helper: collapsible section ────────────────────────────────
function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-line overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-semibold text-muted uppercase tracking-wide hover:bg-sunken transition-colors"
      >
        <span className="flex items-center gap-2">
          <Icon size={13} />
          {title}
        </span>
        {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="border-t border-line px-3.5 py-3 space-y-2"
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}

// ─── Helper: stat card ────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, dim, highlight }) {
  return (
    <div className={`rounded-xl p-3 flex flex-col gap-1.5 border ${highlight ? 'border-orange-400/30 bg-orange-400/8' : 'bg-sunken border-transparent'}`}>
      <Icon size={13} className={highlight ? 'text-orange-400' : 'text-muted'} />
      <p className={`text-lg font-semibold tabular-nums leading-none ${dim ? 'text-muted' : highlight ? 'text-orange-500' : ''}`}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}

// ─── Helper: tier row ─────────────────────────────────────────────
function TierRow({ tier, label, desc, active, value, llmCalls = 0, llmNote }) {
  return (
    <div className={`rounded-lg border px-3 py-2.5 flex items-start gap-3 transition-all ${active ? 'border-accent/40 bg-accent-soft' : 'border-line bg-sunken opacity-60'}`}>
      <div className={`mt-0.5 h-5 w-5 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold ${active ? 'bg-accent text-accent-fg' : 'bg-line text-muted'}`}>
        {tier}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-xs font-semibold ${active ? '' : 'text-muted'}`}>{label}</p>
          <LlmBadge calls={llmCalls} note={llmNote} />
        </div>
        <p className="text-[11px] text-muted leading-tight mt-0.5">{desc}</p>
        {active && value && (
          <p className="mt-1.5 rounded bg-surface px-2 py-1 text-[11px] font-mono text-accent truncate">{value}</p>
        )}
      </div>
      <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${active ? 'bg-accent' : 'bg-line'}`} />
    </div>
  )
}

// ─── LLM budget breakdown table ───────────────────────────────────
function LlmBudgetTable({ trace, totalAgentLlmCalls }) {
  const tierCalls = trace.tier_llm_calls || {}
  const supervisorCalls = tierCalls.supervisor_rewriter ?? 1
  const summaryCalls = tierCalls.rolling_summary ?? 0
  const memoryTotal = trace.total_memory_llm_calls ?? (supervisorCalls + summaryCalls)
  const agentOnlyTotal = Math.max(0, (totalAgentLlmCalls || 0) - memoryTotal)

  const rows = [
    {
      label: 'Sliding Window (Tier 1)',
      calls: 0,
      note: 'Pure state slice — zero cost',
      free: true,
    },
    {
      label: 'Rolling Summary (Tier 2)',
      calls: summaryCalls,
      note: summaryCalls > 0
        ? 'Triggered: thread ≥ 10 messages'
        : 'Skipped: thread below threshold',
      free: summaryCalls === 0,
    },
    {
      label: 'Supervisor + Rewriter (Tier 3)',
      calls: supervisorCalls,
      note: tierCalls.supervisor_rewriter_note || '1 call — routing + disambiguation combined',
      free: false,
    },
    {
      label: 'Constraint Inheritance (Tier 4)',
      calls: 0,
      note: 'State lookup — zero cost',
      free: true,
    },
    {
      label: 'Mem0 / Vector search',
      calls: 0,
      note: 'Embedding-only — no generation call',
      free: true,
    },
  ]

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="bg-sunken px-3.5 py-2 border-b border-line flex items-center gap-2">
        <BrainCircuit size={12} className="text-muted" />
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted">LLM Cost Breakdown</span>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-line">
            <th className="px-3 py-2 text-left font-semibold text-muted text-[10px] uppercase tracking-wide">Operation</th>
            <th className="px-3 py-2 text-right font-semibold text-muted text-[10px] uppercase tracking-wide">Calls</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={`border-b border-line last:border-0 ${r.calls > 0 ? 'bg-orange-400/5' : ''}`}>
              <td className="px-3 py-2">
                <p className={`font-medium ${r.calls > 0 ? '' : 'text-muted'}`}>{r.label}</p>
                <p className="text-[10px] text-muted mt-0.5">{r.note}</p>
              </td>
              <td className="px-3 py-2 text-right">
                {r.calls > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/30 bg-orange-400/10 px-2 py-0.5 font-bold text-orange-500">
                    <FlameKindling size={9} />
                    {r.calls}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-line bg-sunken px-2 py-0.5 font-bold text-muted">
                    <Minus size={9} />
                    0
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-sunken border-t border-line">
            <td className="px-3 py-2 font-bold text-xs">Memory pipeline total</td>
            <td className="px-3 py-2 text-right">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-bold text-xs border ${memoryTotal > 1
                ? 'border-orange-400/30 bg-orange-400/10 text-orange-500'
                : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-600'}`}>
                <FlameKindling size={10} />
                {memoryTotal}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ─── Empty / no memory trace ────────────────────────────────────
function EmptyMemory() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
      <div className="rounded-full bg-sunken p-4">
        <Brain size={22} className="text-muted" />
      </div>
      <p className="text-sm font-semibold">No memory trace yet</p>
      <p className="text-xs text-muted max-w-[220px]">
        Send a message to see how the agent picks its memory strategy and
        which steps cost LLM calls.
      </p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────
export default function MemoryPanel({ message }) {
  const trace = message?.run?.memoryTrace
  if (!trace) return <EmptyMemory />

  const strategy = STRATEGY_META[trace.strategy_chosen] || STRATEGY_META.fresh
  const StratIcon = strategy.icon
  const constraints = Object.entries(message?.run?.constraints || {})
    .filter(([k, v]) => v && k !== 'special_preferences')
    .map(([k, v]) => [k.replace(/_/g, ' '), Array.isArray(v) ? v.join(', ') : String(v)])

  const queryRewritten = trace.query_was_rewritten
  const hasConstraints = trace.constraint_keys_inherited?.length > 0
  const hasSummary = trace.rolling_summary_triggered
  const isChatTurn = message?.run?.intent === 'chat'
  const tierCalls = trace.tier_llm_calls || {}
  const totalMemoryLlm = trace.total_memory_llm_calls ?? 1
  const totalAgentLlmCalls = message?.run?.llmCalls

  return (
    <div className="space-y-4">
      {/* ── Strategy badge ── */}
      <div className={`rounded-xl border px-4 py-3.5 ${strategy.color}`}>
        <div className="flex items-center gap-2 mb-1">
          <div className={`h-2 w-2 rounded-full ${strategy.dot}`} />
          <StratIcon size={14} />
          <p className="text-xs font-bold uppercase tracking-wide">{strategy.label}</p>
        </div>
        <p className="text-xs leading-relaxed">{strategy.desc}</p>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon={History}
          label="Window size"
          value={trace.sliding_window_size > 0 ? `${trace.sliding_window_size} msgs` : '—'}
          dim={trace.sliding_window_size === 0}
        />
        <StatCard
          icon={FlameKindling}
          label="Memory LLM"
          value={`${totalMemoryLlm} call${totalMemoryLlm !== 1 ? 's' : ''}`}
          highlight={totalMemoryLlm > 0}
          dim={false}
        />
        <StatCard
          icon={Database}
          label="Mem0 / trips"
          value={`${trace.mem0_hits ?? 0} / ${trace.vector_hits ?? 0}`}
          dim={!trace.mem0_hits && !trace.vector_hits}
        />
      </div>

      {/* ── 4-Tier memory pipeline ── */}
      <Section title="Memory Pipeline" icon={Brain}>
        <div className="space-y-2">
          <TierRow
            tier="1"
            label="Sliding Window"
            desc={`Last ${trace.sliding_window_size || 0} messages loaded from thread checkpoint`}
            active={trace.sliding_window_size > 0}
            value={trace.sliding_window_size > 0 ? `${trace.sliding_window_size} messages in LLM context` : null}
            llmCalls={tierCalls.sliding_window ?? 0}
            llmNote="Pure state slice — zero LLM cost"
          />
          <TierRow
            tier="2"
            label="Rolling Summary"
            desc={hasSummary
              ? `${trace.thread_msg_count} turn thread — older turns compressed into bullets`
              : `Thread has ${trace.thread_msg_count || 0} turn${(trace.thread_msg_count || 0) !== 1 ? 's' : ''} — below 10, no compression needed`}
            active={hasSummary}
            value={hasSummary && trace.rolling_summary_preview
              ? trace.rolling_summary_preview
              : null}
            llmCalls={tierCalls.rolling_summary ?? 0}
            llmNote={hasSummary
              ? "1 LLM call to compress old turns into bullet points"
              : "Skipped — no call made"}
          />
          <TierRow
            tier="3"
            label="2-in-1 Supervisor Rewriter"
            desc={queryRewritten
              ? '"there" / relative reference resolved inside the supervisor — 0 extra LLM calls'
              : 'Query is self-contained — rewriting step skipped'}
            active
            value={queryRewritten ? trace.resolved_query : null}
            llmCalls={tierCalls.supervisor_rewriter ?? 1}
            llmNote={tierCalls.supervisor_rewriter_note || "1 call — routing + disambiguation combined (no extra call)"}
          />
          <TierRow
            tier="4"
            label="Constraint Inheritance"
            desc={hasConstraints
              ? `${trace.constraint_keys_inherited.join(', ')} carried over from prior turns`
              : 'No prior constraints to inherit'}
            active={hasConstraints}
            value={hasConstraints ? trace.constraint_keys_inherited.join(' · ') : null}
            llmCalls={tierCalls.constraint_inherit ?? 0}
            llmNote="State lookup — zero LLM cost"
          />
        </div>
      </Section>

      {/* ── LLM cost breakdown table ── */}
      <LlmBudgetTable trace={trace} totalAgentLlmCalls={totalAgentLlmCalls} />

      {/* ── Query resolution diff ── */}
      {queryRewritten && (
        <Section title="Query Resolution" icon={ArrowRightLeft}>
          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1">Original</p>
              <p className="rounded-lg bg-sunken px-3 py-2 text-xs text-muted italic">
                "{trace.original_query}"
              </p>
            </div>
            <div className="flex justify-center">
              <ArrowRightLeft size={14} className="text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted mb-1">Resolved</p>
              <p className="rounded-lg bg-accent-soft border border-accent/25 px-3 py-2 text-xs font-medium">
                "{trace.resolved_query}"
              </p>
            </div>
          </div>
        </Section>
      )}

      {/* ── Active constraints ── */}
      {constraints.length > 0 && (
        <Section title="Active Constraints" icon={Zap} defaultOpen>
          <dl className="flex flex-wrap gap-2">
            {constraints.map(([k, v]) => (
              <div key={k} className="rounded-lg bg-accent-soft border border-accent/25 px-2.5 py-1 text-xs">
                <dt className="inline text-muted capitalize">{k}: </dt>
                <dd className="inline font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </Section>
      )}

      {/* ── LLM efficiency callout ── */}
      <div className="rounded-xl bg-sunken border border-line px-3.5 py-3 flex items-start gap-2.5">
        <Wind size={14} className="text-accent mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold">
            {totalMemoryLlm <= 1 ? 'Minimal LLM overhead' : 'Rolling summary was needed'}
          </p>
          <p className="text-[11px] text-muted leading-relaxed mt-0.5">
            {isChatTurn
              ? `History recall used the sliding window context — ${totalMemoryLlm} LLM call total (1 for chat reply).`
              : hasSummary
                ? `Rolling summary added 1 extra LLM call. Normal turns only use 1 call (supervisor). Long threads compress automatically to stay efficient.`
                : queryRewritten
                  ? 'Coreference resolution was piggybacked on the supervisor call — 0 extra LLM calls for disambiguation.'
                  : hasConstraints
                    ? 'Constraints were loaded from state — no extra model call needed for context.'
                    : 'No disambiguation was needed this turn — 1 LLM call for supervisor routing only.'}
          </p>
        </div>
      </div>
    </div>
  )
}
