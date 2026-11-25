import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Loader2, PencilLine, AlertCircle } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { approvePlan } from '../store/chatSlice'

export default function ApprovalCard({ threadId, approval, busy }) {
  const dispatch = useDispatch()
  const [revising, setRevising] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  if (approval.state !== 'pending') {
    return (
      <p className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sunken px-3 py-1.5 text-xs font-semibold text-muted">
        {approval.state === 'approved' ? <Check size={14} className="text-success" /> : <PencilLine size={14} />}
        {approval.state === 'approved' ? 'You approved this draft' : 'You asked for changes'}
      </p>
    )
  }

  const act = async (approved) => {
    if (!approved && !feedback.trim()) {
      setError('Tell the agents what to change.')
      return
    }
    setError('')
    try {
      await dispatch(approvePlan({ threadId, approved, feedback })).unwrap()
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Could not submit your review. Try again.')
    }
  }

  return (
    <div className="mt-5 rounded-2xl border border-line bg-surface p-4">
      <p className="text-sm font-semibold">Review this draft</p>
      <p className="mt-1 text-sm text-muted">{approval.request || 'Approve it to get the final plan, or ask for changes.'}</p>

      <AnimatePresence initial={false}>
        {revising && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              maxLength={1000}
              autoFocus
              placeholder="e.g. Add more vegetarian options and keep the hotel under ₹4,000 a night"
              aria-label="What should change?"
              className="input mt-3 resize-none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-danger">
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!revising ? (
          <>
            <button className="btn btn-primary" disabled={busy} onClick={() => act(true)}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Approve plan
            </button>
            <button className="btn btn-outline" disabled={busy} onClick={() => setRevising(true)}>
              <PencilLine size={16} /> Request changes
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" disabled={busy} onClick={() => act(false)}>
              {busy && <Loader2 size={16} className="animate-spin" />} Send changes
            </button>
            <button className="btn btn-ghost" disabled={busy} onClick={() => { setRevising(false); setError('') }}>Cancel</button>
          </>
        )}
      </div>
    </div>
  )
}
