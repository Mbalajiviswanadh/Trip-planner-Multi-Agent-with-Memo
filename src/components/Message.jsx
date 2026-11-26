import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Check, Copy, RefreshCw, Workflow } from 'lucide-react'
import { useDispatch } from 'react-redux'
import Logo from './Logo'
import Markdown from './Markdown'
import ApprovalCard from './ApprovalCard'
import { showFlowFor } from '../store/uiSlice'
import { sendMessage } from '../store/chatSlice'

function Message({ message, threadId, busy }) {
  const dispatch = useDispatch()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard unavailable */ }
  }

  if (message.role === 'user') {
    return (
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-sunken px-4 py-2.5 text-[0.95rem]">{message.content}</p>
      </motion.div>
    )
  }

  if (message.kind === 'error') {
    return (
      <div role="alert" className="flex gap-3">
        <span className="mt-0.5 shrink-0 text-danger"><AlertCircle size={20} /></span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-danger">That didn't go through</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{message.content}</p>
          {message.retryText && (
            <button disabled={busy} className="btn btn-outline mt-3 !py-1.5" onClick={() => dispatch(sendMessage({ threadId, text: message.retryText, retry: true }))}>
              <RefreshCw size={14} /> Try again
            </button>
          )}
        </div>
      </div>
    )
  }

  const hasFlow = !!message.run
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex gap-3">
      <span className="mt-1 shrink-0"><Logo size={24} withText={false} /></span>
      <div className="min-w-0 flex-1">
        {message.kind === 'draft' && <p className="mb-2 text-xs font-semibold text-accent">Draft itinerary</p>}
        <Markdown>{message.content}</Markdown>
        {message.approval && <ApprovalCard threadId={threadId} approval={message.approval} busy={busy} />}
        <div className="mt-3 flex items-center gap-1">
          <button className="icon-btn h-8 w-8" onClick={copy} aria-label="Copy message">
            {copied ? <Check size={15} className="text-success" /> : <Copy size={15} />}
          </button>
          {hasFlow && (
            <button className="icon-btn h-8 w-auto gap-1.5 px-2 text-xs font-semibold" onClick={() => dispatch(showFlowFor(message.id))}>
              <Workflow size={15} /> Agent flow
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default memo(Message)
