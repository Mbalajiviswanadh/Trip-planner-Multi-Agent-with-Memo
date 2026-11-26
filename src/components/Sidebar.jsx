import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { LogOut, Plug, Plus, RefreshCw } from 'lucide-react'
import Logo from './Logo'
import McpModal from './McpModal'
import ThreadItem from './ThreadItem'
import { api } from '../lib/api'
import { fetchThreads } from '../store/threadsSlice'
import { logout } from '../store/authSlice'
import { groupThreads, initials } from '../lib/format'

export default function Sidebar({ onNavigate }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const { items, status, error } = useSelector((s) => s.threads)
  const [mcpOpen, setMcpOpen] = useState(false)
  const [mcpCount, setMcpCount] = useState(0)

  useEffect(() => {
    if (status === 'idle') dispatch(fetchThreads())
  }, [status, dispatch])

  useEffect(() => {
    api.mcpServers()
      .then((res) => setMcpCount((res.servers || []).filter((s) => s.enabled).length))
      .catch(() => {})
  }, [])

  const newChat = () => {
    navigate('/')
    onNavigate?.()
  }

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <Logo />
      </div>
      <div className="space-y-1.5 px-3 pb-2">
        <button className="btn btn-outline w-full justify-start" onClick={newChat}>
          <Plus size={16} /> New trip
        </button>
        <button className="btn btn-outline w-full justify-between" onClick={() => setMcpOpen(true)}>
          <span className="flex items-center gap-2"><Plug size={15} /> MCP Integrations</span>
          {mcpCount > 0 && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-bold text-accent">
              {mcpCount}
            </span>
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-3" aria-label="Chats">
        {status === 'loading' && items.length === 0 && (
          <div className="space-y-2 pt-3" aria-hidden="true">
            {[70, 52, 84, 60].map((w) => (
              <div key={w} className="skeleton h-8 rounded-lg" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        {status === 'error' && (
          <div role="alert" className="mt-3 rounded-xl border border-line bg-sunken p-3 text-sm">
            <p className="text-danger">{error}</p>
            <button className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-accent" onClick={() => dispatch(fetchThreads())}>
              <RefreshCw size={12} /> Try again
            </button>
          </div>
        )}

        {status === 'ready' && items.length === 0 && (
          <p className="px-2 pt-4 text-sm text-muted">Your trips will appear here once you start planning.</p>
        )}

        {groupThreads(items).map(([label, list]) => (
          <section key={label} className="mt-4">
            <h2 className="px-3 pb-1 text-xs font-semibold text-muted">{label}</h2>
            <ul className="space-y-0.5">
              {list.map((t) => (
                <ThreadItem key={t.id} thread={t} onNavigate={onNavigate} />
              ))}
            </ul>
          </section>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-line p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
          {initials(user?.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="truncate text-xs text-muted">{user?.email}</p>
        </div>
        <button className="icon-btn" onClick={() => dispatch(logout())} aria-label="Sign out">
          <LogOut size={16} />
        </button>
      </div>
      <McpModal
        open={mcpOpen}
        onClose={() => setMcpOpen(false)}
        onChanged={(list) => setMcpCount(list.filter((s) => s.enabled).length)}
      />
    </div>
  )
}
