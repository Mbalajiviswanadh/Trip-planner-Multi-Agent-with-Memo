import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Calendar, CheckCircle2, ChevronDown, ChevronRight, ExternalLink,
  FileText, Globe, Loader2, Plug, Plus, Trash2, X, AlertCircle,
} from 'lucide-react'
import { api } from '../lib/api'

function ServerIcon({ slug }) {
  if (slug === 'google_drive') return <FileText size={16} className="text-blue-500" />
  if (slug === 'google_calendar') return <Calendar size={16} className="text-emerald-500" />
  return <Globe size={16} className="text-violet-500" />
}

function ConnectedRow({ server, onToggle, onDelete }) {
  const [open, setOpen] = useState(false)
  const tools = server.cached_tools || []

  return (
    <li className="rounded-xl border border-line bg-surface p-3.5 space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="rounded-lg bg-sunken p-2 shrink-0">
            <ServerIcon slug={server.server_slug} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{server.display_name}</p>
            <p className="text-xs text-muted truncate">
              {server.transport === 'builtin_google' ? 'Google OAuth2' : `${server.transport} • ${server.auth_type}`}
              {' · '}
              {tools.length} tool{tools.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onToggle(server.id, !server.enabled)}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
              server.enabled
                ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                : 'bg-sunken text-muted border-line'
            }`}
          >
            {server.enabled ? 'Enabled' : 'Paused'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(server.id)}
            className="icon-btn text-muted hover:text-danger"
            aria-label={`Disconnect ${server.display_name}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {tools.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1 text-xs font-medium text-muted hover:text-ink"
          >
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            Discovered tools ({tools.length})
          </button>
          {open && (
            <ul className="mt-2 space-y-1.5 pl-4 border-l border-line">
              {tools.map((t) => (
                <li key={t.name} className="text-xs">
                  <span className="font-mono font-semibold text-accent">{t.name}</span>
                  {t.description && <span className="text-muted"> — {t.description}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  )
}

export default function McpModal({ open, onClose, onChanged }) {
  const [tab, setTab] = useState('catalog')
  const [catalog, setCatalog] = useState([])
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(false)
  const [busySlug, setBusySlug] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Custom remote MCP form
  const [customName, setCustomName] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [customTransport, setCustomTransport] = useState('streamable_http')
  const [customKey, setCustomKey] = useState('')

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      const [catRes, srvRes] = await Promise.all([api.mcpCatalog(), api.mcpServers()])
      setCatalog(catRes.catalog || [])
      const list = srvRes.servers || []
      setServers(list)
      onChanged?.(list)
    } catch (e) {
      setError(e?.message || 'Failed to load MCP integrations.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setCustomName('')
      setCustomUrl('')
      setCustomTransport('streamable_http')
      setCustomKey('')
      loadAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    const onMsg = (ev) => {
      if (ev?.data?.type === 'mcp_oauth_result') {
        setBusySlug('')
        if (ev.data.success) {
          setNotice(ev.data.message || 'Connected!')
          setError('')
          loadAll()
          setTab('connected')
        } else {
          setError(ev.data.message || 'OAuth authorization failed.')
        }
      }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openOAuthPopup = (url) => {
    const w = 520
    const h = 640
    const left = window.screenX + (window.outerWidth - w) / 2
    const top = window.screenY + (window.outerHeight - h) / 2
    window.open(url, 'tripmate_mcp_oauth', `width=${w},height=${h},left=${left},top=${top}`)
  }

  const connectBuiltin = async (entry) => {
    setBusySlug(entry.slug)
    setError('')
    setNotice('')
    try {
      const res = await api.mcpConnect({ server_slug: entry.slug, display_name: entry.name })
      if (res.status === 'auth_required' && res.authorize_url) {
        openOAuthPopup(res.authorize_url)
      } else {
        setNotice(`Connected ${entry.name}!`)
        setBusySlug('')
        await loadAll()
        setTab('connected')
      }
    } catch (e) {
      setError(e?.message || `Could not connect ${entry.name}.`)
      setBusySlug('')
    }
  }

  const connectCustom = async (e) => {
    e.preventDefault()
    if (!customUrl.trim()) return
    setBusySlug('custom_remote')
    setError('')
    setNotice('')
    try {
      const res = await api.mcpConnect({
        server_slug: 'custom_remote',
        display_name: customName.trim(),
        url: customUrl.trim(),
        transport: customTransport,
        api_key: customKey.trim(),
      })
      if (res.status === 'auth_required' && res.authorize_url) {
        openOAuthPopup(res.authorize_url)
      } else {
        setNotice(`Connected ${res.connection?.display_name || 'MCP server'}!`)
        setCustomName('')
        setCustomUrl('')
        setCustomKey('')
        setBusySlug('')
        await loadAll()
        setTab('connected')
      }
    } catch (e2) {
      setError(e2?.message || 'Failed to connect remote MCP server.')
      setBusySlug('')
    }
  }

  const handleToggle = async (id, enabled) => {
    try {
      await api.mcpToggle(id, enabled)
      await loadAll()
    } catch (e) {
      setError(e?.message || 'Could not update connection.')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.mcpDelete(id)
      await loadAll()
    } catch (e) {
      setError(e?.message || 'Could not disconnect server.')
    }
  }

  if (!open) return null

  const connectedSlugs = new Set(servers.map((s) => s.server_slug))

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 bg-ink/45 backdrop-blur-[1px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="relative z-10 flex max-h-[85vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-xl"
        >
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <div className="flex items-center gap-2.5">
              <Plug size={18} className="text-accent" />
              <div>
                <h2 className="text-sm font-semibold">MCP Integrations</h2>
                <p className="text-xs text-muted">Connect external tools dynamically for your travel agent</p>
              </div>
            </div>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </header>

          <div className="flex border-b border-line px-4 pt-1 gap-2">
            <button
              type="button"
              onClick={() => setTab('catalog')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                tab === 'catalog' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              Add MCP Server
            </button>
            <button
              type="button"
              onClick={() => setTab('connected')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                tab === 'connected' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              Connected ({servers.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            {notice && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600">
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                <span>{notice}</span>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-10 text-xs text-muted gap-2">
                <Loader2 size={15} className="animate-spin" /> Loading integrations…
              </div>
            ) : tab === 'catalog' ? (
              <div className="space-y-4">
                {catalog
                  .filter((c) => c.slug !== 'custom_remote')
                  .map((entry) => {
                    const already = connectedSlugs.has(entry.slug)
                    const busy = busySlug === entry.slug
                    return (
                      <div key={entry.slug} className="rounded-xl border border-line p-4 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="rounded-lg bg-sunken p-2.5 shrink-0">
                            <ServerIcon slug={entry.slug} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{entry.name}</p>
                            <p className="text-xs text-muted mt-0.5 leading-relaxed">{entry.description}</p>
                            <p className="text-[11px] text-muted mt-1.5">
                              Tools: {(entry.tools_preview || []).map((t) => t.name).join(', ')}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => connectBuiltin(entry)}
                          className="btn btn-outline shrink-0 text-xs !py-1.5 !px-3"
                        >
                          {busy ? <Loader2 size={13} className="animate-spin" /> : <ExternalLink size={13} />}
                          {already ? 'Reconnect' : 'Connect'}
                        </button>
                      </div>
                    )
                  })}

                <form onSubmit={connectCustom} autoComplete="off" className="rounded-xl border border-line p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-violet-500" />
                    <h3 className="text-sm font-semibold">Custom Remote MCP (URL / API Key / OAuth 2.1)</h3>
                  </div>
                  <p className="text-xs text-muted">
                    Enter any HTTPS MCP server URL. If it requires OAuth 2.1, TripMate will automatically open the authorization flow.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      name="mcp_display_name"
                      autoComplete="off"
                      data-lpignore="true"
                      placeholder="Display name (e.g. Notion MCP)"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="rounded-lg border border-line bg-sunken px-3 py-2 text-xs outline-none focus:border-accent"
                    />
                    <select
                      name="mcp_transport"
                      value={customTransport}
                      onChange={(e) => setCustomTransport(e.target.value)}
                      className="rounded-lg border border-line bg-sunken px-3 py-2 text-xs outline-none focus:border-accent"
                    >
                      <option value="streamable_http">streamable_http</option>
                      <option value="sse">sse</option>
                    </select>
                  </div>
                  <input
                    type="url"
                    name="mcp_server_url"
                    autoComplete="off"
                    data-lpignore="true"
                    required
                    placeholder="https://mcp.example.com/mcp"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="w-full rounded-lg border border-line bg-sunken px-3 py-2 text-xs outline-none focus:border-accent"
                  />
                  <input
                    type="text"
                    name="mcp_api_token"
                    autoComplete="off"
                    data-lpignore="true"
                    spellCheck={false}
                    style={{ WebkitTextSecurity: 'disc' }}
                    placeholder="API Key or Bearer Token (leave blank for open or OAuth 2.1 servers)"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    className="w-full rounded-lg border border-line bg-sunken px-3 py-2 text-xs outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    disabled={busySlug === 'custom_remote'}
                    className="btn btn-primary w-full justify-center text-xs !py-2"
                  >
                    {busySlug === 'custom_remote' ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Connect & Discover Tools
                  </button>
                </form>
              </div>
            ) : servers.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <p className="text-sm font-semibold">No MCP servers connected yet</p>
                <p className="text-xs text-muted">Switch to "Add MCP Server" to connect Google Drive, Calendar, or a custom MCP URL.</p>
              </div>
            ) : (
              <ul className="space-y-2.5">
                {servers.map((srv) => (
                  <ConnectedRow
                    key={srv.id}
                    server={srv}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
