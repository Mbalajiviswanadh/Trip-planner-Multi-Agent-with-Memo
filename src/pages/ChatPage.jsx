import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Menu, PanelRight } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import Composer from '../components/Composer'
import EmptyState from '../components/EmptyState'
import Message from '../components/Message'
import PendingMessage from '../components/PendingMessage'
import FlowPanel from '../components/FlowPanel'
import ThemeToggle from '../components/ThemeToggle'
import { createThread } from '../store/threadsSlice'
import { loadHistory, sendMessage } from '../store/chatSlice'
import { setFlowOpen, setSidebar } from '../store/uiSlice'
import { useMedia } from '../lib/format'

const NONE = []

export default function ChatPage() {
  const { threadId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const isXl = useMedia('(min-width: 1280px)')
  const bottom = useRef(null)
  const [startError, setStartError] = useState('')

  const bucket = useSelector((s) => (threadId ? s.chat.byThread[threadId] : undefined))
  const pending = useSelector((s) => (threadId ? s.chat.pending[threadId] : undefined))
  const thread = useSelector((s) => s.threads.items.find((t) => t.id === threadId))
  const { sidebarOpen, flowOpen, flowMessageId } = useSelector((s) => s.ui)

  const messages = bucket?.messages || NONE
  const awaiting = messages.some((m) => m.approval?.state === 'pending')
  const flowMessage = useMemo(
    () =>
      messages.find((m) => m.id === flowMessageId && m.run) ||
      [...messages].reverse().find((m) => m.run?.intent === 'travel' || m.run?.agents?.length > 0) ||
      [...messages].reverse().find((m) => m.run) ||
      null,
    [messages, flowMessageId],
  )

  useEffect(() => {
    setStartError('')
    if (threadId && !bucket) dispatch(loadHistory(threadId))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId])

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, pending?.streamText, pending?.statusText, threadId])

  const send = async (text) => {
    setStartError('')
    let id = threadId
    if (!id) {
      try {
        const t = await dispatch(createThread(text.slice(0, 48))).unwrap()
        id = t.id
      } catch (e) {
        setStartError(typeof e === 'string' ? e : 'Could not start a new chat.')
        return
      }
    }
    dispatch(sendMessage({ threadId: id, text }))
    if (!threadId) navigate(`/c/${id}`, { replace: true })
  }

  const blocked = !!pending || awaiting
  const placeholder = awaiting ? 'Review the draft above to continue' : pending ? 'Working on your plan…' : 'Describe your trip'
  const showEmpty = messages.length === 0 && !pending && !bucket?.loading

  return (
    <div className="flex h-dvh overflow-hidden">
      <aside className="hidden w-72 shrink-0 border-r border-line lg:block">
        <Sidebar />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="mobile-sidebar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-ink/40" onClick={() => dispatch(setSidebar(false))} />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72 max-w-[85%] border-r border-line"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.2 }}
            >
              <Sidebar onNavigate={() => dispatch(setSidebar(false))} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <button className="icon-btn lg:hidden" onClick={() => dispatch(setSidebar(true))} aria-label="Open chats"><Menu size={18} /></button>
            <h1 className="truncate text-sm font-semibold">{thread?.title || 'New trip'}</h1>
          </div>
          <div className="flex items-center gap-1">
            <button className={`icon-btn ${flowOpen ? '!bg-accent-soft !text-accent' : ''}`} onClick={() => dispatch(setFlowOpen(!flowOpen))} aria-label="Toggle agent flow" aria-pressed={flowOpen}>
              <PanelRight size={18} />
            </button>
            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {showEmpty ? (
            <EmptyState onPick={send} disabled={blocked} />
          ) : (
            <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8">
              {bucket?.loading && messages.length === 0 && (
                <div className="space-y-3" aria-hidden="true">
                  <div className="skeleton ml-auto h-10 w-1/2 rounded-2xl" />
                  <div className="skeleton h-24 w-5/6 rounded-2xl" />
                </div>
              )}
              {messages.map((m) => (
                <Message key={m.id} message={m} threadId={threadId} busy={!!pending} />
              ))}
              {pending && <PendingMessage pending={pending} />}
              <div ref={bottom} />
            </div>
          )}
        </div>

        {startError && (
          <p role="alert" className="mx-auto mb-2 flex w-full max-w-3xl items-center gap-2 px-4 text-sm text-danger">
            <AlertCircle size={16} /> {startError}
          </p>
        )}
        <Composer onSend={send} disabled={blocked} placeholder={placeholder} autoFocusKey={threadId || 'new'} />
      </section>

      {isXl ? (
        <motion.aside
          initial={false}
          animate={{ width: flowOpen ? 380 : 0 }}
          transition={{ type: 'tween', duration: 0.22 }}
          className={`shrink-0 overflow-hidden border-l border-line ${flowOpen ? '' : 'pointer-events-none border-l-0'}`}
          aria-hidden={!flowOpen}
        >
          {flowOpen && (
            <div className="h-full w-[380px]">
              <FlowPanel message={flowMessage} pending={pending} onClose={() => dispatch(setFlowOpen(false))} />
            </div>
          )}
        </motion.aside>
      ) : (
        <AnimatePresence>
          {flowOpen && (
            <motion.div
              key="mobile-flow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, pointerEvents: 'none' }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40"
            >
              <div className="absolute inset-0 bg-ink/40" onClick={() => dispatch(setFlowOpen(false))} />
              <motion.aside
                className="absolute inset-y-0 right-0 w-[400px] max-w-[92%] border-l border-line"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.2 }}
              >
                <FlowPanel message={flowMessage} pending={pending} onClose={() => dispatch(setFlowOpen(false))} />
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
