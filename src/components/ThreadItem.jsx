import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate, useMatch } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Check, Loader2, Pencil, Trash2, X } from 'lucide-react'
import { removeThread, renameThread } from '../store/threadsSlice'

export default function ThreadItem({ thread, onNavigate }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const active = useMatch(`/c/${thread.id}`)
  const [confirming, setConfirming] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draftTitle, setDraftTitle] = useState(thread.title || '')
  const [busy, setBusy] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (editing) {
      setDraftTitle(thread.title || '')
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [editing, thread.title])

  const saveRename = async () => {
    const clean = draftTitle.trim()
    if (!clean || clean === (thread.title || '').trim()) {
      setEditing(false)
      return
    }
    setBusy(true)
    try {
      await dispatch(renameThread({ id: thread.id, title: clean })).unwrap()
      setEditing(false)
    } catch {
      // keep editing open on error
    } finally {
      setBusy(false)
    }
  }

  const del = async () => {
    setBusy(true)
    try {
      await dispatch(removeThread(thread.id)).unwrap()
      if (active) navigate('/chat')
    } catch {
      setBusy(false)
      setConfirming(false)
    }
  }

  if (editing) {
    return (
      <li className="flex items-center gap-1 rounded-lg bg-sunken px-2 py-1">
        <input
          ref={inputRef}
          type="text"
          value={draftTitle}
          maxLength={120}
          disabled={busy}
          onChange={(e) => setDraftTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveRename()
            if (e.key === 'Escape') setEditing(false)
          }}
          className="min-w-0 flex-1 bg-transparent px-1 text-sm text-ink outline-none"
          aria-label="Rename chat"
        />
        <button className="icon-btn h-7 w-7 !text-emerald-600" onClick={saveRename} disabled={busy} aria-label="Save name">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
        </button>
        <button className="icon-btn h-7 w-7" onClick={() => setEditing(false)} disabled={busy} aria-label="Cancel rename">
          <X size={14} />
        </button>
      </li>
    )
  }

  return (
    <li className="group relative">
      <NavLink
        to={`/c/${thread.id}`}
        onClick={onNavigate}
        className={`block truncate rounded-lg px-3 py-2 pr-14 text-sm transition-colors ${
          active ? 'bg-accent-soft font-semibold text-ink' : 'text-muted hover:bg-sunken hover:text-ink'
        }`}
      >
        {thread.title || 'New trip'}
      </NavLink>

      <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center bg-gradient-to-l from-surface via-surface to-transparent pl-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100">
        {confirming ? (
          <>
            <button className="icon-btn h-7 w-7 !text-danger" onClick={del} disabled={busy} aria-label="Confirm delete">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
            <button className="icon-btn h-7 w-7" onClick={() => setConfirming(false)} disabled={busy} aria-label="Cancel delete">
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <button
              className="icon-btn h-7 w-7"
              onClick={(e) => {
                e.preventDefault()
                setEditing(true)
              }}
              aria-label={`Rename ${thread.title || 'chat'}`}
              title="Rename chat"
            >
              <Pencil size={13} />
            </button>
            <button
              className="icon-btn h-7 w-7 hover:!text-danger"
              onClick={(e) => {
                e.preventDefault()
                setConfirming(true)
              }}
              aria-label={`Delete ${thread.title || 'chat'}`}
              title="Delete chat"
            >
              <Trash2 size={13} />
            </button>
          </>
        )}
      </div>
    </li>
  )
}
