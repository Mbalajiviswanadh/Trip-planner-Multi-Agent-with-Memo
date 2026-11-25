import { useState } from 'react'
import { NavLink, useNavigate, useMatch } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Check, Trash2, X, Loader2 } from 'lucide-react'
import { removeThread } from '../store/threadsSlice'

export default function ThreadItem({ thread, onNavigate }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const active = useMatch(`/c/${thread.id}`)
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)

  const del = async () => {
    setBusy(true)
    try {
      await dispatch(removeThread(thread.id)).unwrap()
      if (active) navigate('/')
    } catch {
      setBusy(false)
      setConfirming(false)
    }
  }

  return (
    <li className="group relative">
      <NavLink
        to={`/c/${thread.id}`}
        onClick={onNavigate}
        className={`block truncate rounded-lg px-3 py-2 pr-10 text-sm transition-colors ${
          active ? 'bg-accent-soft font-semibold text-ink' : 'text-muted hover:bg-sunken hover:text-ink'
        }`}
      >
        {thread.title || 'New trip'}
      </NavLink>
      <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
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
          <button
            className="icon-btn h-7 w-7 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${thread.title || 'chat'}`}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </li>
  )
}
