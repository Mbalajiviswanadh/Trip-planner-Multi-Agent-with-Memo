import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../lib/api'
import { logout } from './authSlice'
import { storage } from '../lib/storage'

let counter = 0
const uid = () => `m_${Date.now().toString(36)}_${(counter++).toString(36)}`

const cached = storage.getChat(storage.getAuth()?.user?.id)

const ensure = (s, id) => (s.byThread[id] ??= { messages: [], loaded: false, loading: false })

function buildRun(res, elapsedMs) {
  return {
    intent: res.query_intent || 'travel',
    agents: res.selected_agents || [],
    llmCalls: res.llm_calls ?? 0,
    elapsedMs,
    startedAt: Date.now() - elapsedMs,
    reasoning: res.supervisor_reasoning || '',
    constraints: res.trip_constraints || {},
    results: {
      flights: res.flight_results || '',
      hotels: res.hotel_results || '',
      weather: res.weather_results || '',
      budget: res.budget_results || '',
      mcp: res.user_mcp_results || '',
    },
    memoryTrace: res.memory_trace || null,
    mcpTrace: res.mcp_trace || null,
  }
}

const failText = (e) => e?.message || 'Something went wrong.'

const AGENT_STATUS = {
  supervisor: 'Analyzing your request',
  chat_agent: 'Thinking of a reply',
  guardrail_blocked: 'Checking safety rules',
  flight_agent: 'Searching flights',
  hotel_agent: 'Searching hotels',
  weather_agent: 'Checking weather forecast',
  budget_agent: 'Calculating budget',
  itinerary_agent: 'Drafting your itinerary',
  human_approval: 'Preparing draft for review',
  final_agent: 'Writing your response',
  user_mcp_agent: 'Running connected MCP tools',
}

export const sendMessage = createAsyncThunk(
  'chat/send',
  async ({ threadId, text }, { dispatch, rejectWithValue }) => {
    const t0 = performance.now()
    try {
      const res = await api.travelStream(
        { message: text, thread_id: threadId },
        {
          onEvent: (eventName, payload) => {
            if (eventName === 'agent_started') {
              const agent = payload?.agent || ''
              const label = AGENT_STATUS[agent] || 'Working on it'
              dispatch(slice.actions.streamStatus({
                threadId,
                activeAgent: agent,
                statusText: label,
                liveStep: { stage: agent, text: label },
              }))
            } else if (eventName === 'live_step' && payload?.text) {
              dispatch(slice.actions.streamStatus({
                threadId,
                statusText: payload.text,
                liveStep: { stage: payload.stage || 'step', text: payload.text },
              }))
            } else if (eventName === 'token' && payload?.text) {
              dispatch(slice.actions.streamToken({
                threadId,
                text: payload.text,
              }))
            }
          },
        },
      )
      return { res, elapsedMs: performance.now() - t0 }
    } catch (e) {
      return rejectWithValue(failText(e))
    }
  },
)

export const approvePlan = createAsyncThunk(
  'chat/approve',
  async ({ threadId, approved, feedback }, { rejectWithValue }) => {
    const t0 = performance.now()
    try {
      const res = await api.approve({ thread_id: threadId, approved, feedback: feedback || '' })
      return { res, elapsedMs: performance.now() - t0 }
    } catch (e) {
      return rejectWithValue(failText(e))
    }
  },
)

export const loadHistory = createAsyncThunk('chat/history', async (threadId, { rejectWithValue }) => {
  try {
    const trips = []
    let page = 1
    let totalPages = 1
    do {
      const res = await api.history(threadId, page, 20)
      trips.push(...(res.trips || []))
      totalPages = res.total_pages || 1
      page += 1
    } while (page <= totalPages && page <= 5)
    return trips.reverse() // API returns newest first
  } catch (e) {
    return rejectWithValue(failText(e))
  }
})

const slice = createSlice({
  name: 'chat',
  initialState: { byThread: cached?.byThread || {}, pending: {} },
  reducers: {
    streamStatus(s, a) {
      const { threadId, activeAgent, statusText, liveStep } = a.payload
      if (s.pending[threadId]) {
        if (activeAgent) s.pending[threadId].activeAgent = activeAgent
        if (statusText) s.pending[threadId].statusText = statusText
        if (liveStep?.text) {
          const steps = s.pending[threadId].liveSteps || []
          const prev = steps[steps.length - 1]
          if (!prev || prev.text !== liveStep.text) {
            steps.push({ ...liveStep, ts: Date.now() })
            s.pending[threadId].liveSteps = steps
          }
        }
      }
    },
    streamToken(s, a) {
      const { threadId, text } = a.payload
      if (s.pending[threadId]) {
        s.pending[threadId].streamText = (s.pending[threadId].streamText || '') + text
      }
    },
  },
  extraReducers: (b) => {
    b.addCase(sendMessage.pending, (s, a) => {
      const { threadId, text, retry } = a.meta.arg
      const bucket = ensure(s, threadId)
      if (retry) {
        const last = bucket.messages[bucket.messages.length - 1]
        if (last?.kind === 'error') bucket.messages.pop()
      } else {
        bucket.messages.push({ id: a.meta.requestId, role: 'user', content: text, createdAt: Date.now() })
      }
      bucket.loaded = true
      s.pending[threadId] = { startedAt: Date.now(), statusText: 'Analyzing your request', activeAgent: 'supervisor', streamText: '', liveSteps: [{ stage: 'supervisor', text: 'Analyzing your request', ts: Date.now() }] }
    })
      .addCase(sendMessage.fulfilled, (s, a) => {
        const { threadId } = a.meta.arg
        const { res, elapsedMs } = a.payload
        delete s.pending[threadId]
        const needsApproval = !!res.requires_approval
        ensure(s, threadId).messages.push({
          id: uid(),
          role: 'assistant',
          kind: needsApproval ? 'draft' : 'text',
          content: (needsApproval ? res.itinerary || res.answer : res.answer) || 'Done.',
          createdAt: Date.now(),
          run: buildRun(res, elapsedMs),
          approval: needsApproval ? { state: 'pending', request: res.approval_request || '' } : undefined,
        })
      })
      .addCase(sendMessage.rejected, (s, a) => {
        const { threadId, text } = a.meta.arg
        delete s.pending[threadId]
        ensure(s, threadId).messages.push({
          id: uid(),
          role: 'assistant',
          kind: 'error',
          content: a.payload || 'Something went wrong.',
          retryText: text,
          createdAt: Date.now(),
        })
      })
      .addCase(approvePlan.pending, (s, a) => {
        s.pending[a.meta.arg.threadId] = { startedAt: Date.now() }
      })
      .addCase(approvePlan.fulfilled, (s, a) => {
        const { threadId, approved } = a.meta.arg
        const { res, elapsedMs } = a.payload
        delete s.pending[threadId]
        const bucket = ensure(s, threadId)
        const draft = bucket.messages.find((m) => m.approval?.state === 'pending')
        if (draft) draft.approval.state = approved ? 'approved' : 'revised'
        bucket.messages.push({
          id: uid(),
          role: 'assistant',
          kind: 'final',
          content: res.answer || 'Your plan is ready.',
          createdAt: Date.now(),
          run: buildRun(res, elapsedMs),
        })
      })
      .addCase(approvePlan.rejected, (s, a) => {
        delete s.pending[a.meta.arg.threadId]
      })
      .addCase(loadHistory.pending, (s, a) => {
        ensure(s, a.meta.arg).loading = true
      })
      .addCase(loadHistory.fulfilled, (s, a) => {
        const bucket = ensure(s, a.meta.arg)
        bucket.loading = false
        bucket.loaded = true
        if (bucket.messages.length) return
        a.payload.forEach((t, i) => {
          bucket.messages.push({ id: `h_${i}_u`, role: 'user', content: t.query, createdAt: 0 })
          if (t.answer) {
            // Reconstruct a run object from the history metadata the backend now returns.
            // memory_trace will be null for older turns that predate the feature,
            // but selected_agents and constraints are always available from checkpoint state.
            const run = t.selected_agents || t.trip_constraints
              ? buildRun(t, 0)
              : undefined
            bucket.messages.push({
              id: `h_${i}_a`,
              role: 'assistant',
              kind: 'text',
              content: t.answer,
              createdAt: 0,
              run,
            })
          }
        })
      })
      .addCase(loadHistory.rejected, (s, a) => {
        const bucket = ensure(s, a.meta.arg)
        bucket.loading = false
        bucket.loaded = true
      })
      .addCase(logout, () => ({ byThread: {}, pending: {} }))
  },
})

export default slice.reducer
