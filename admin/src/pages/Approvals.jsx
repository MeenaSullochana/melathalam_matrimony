import { useCallback, useEffect, useState } from 'react'
import { Check, X, Eye, Search, ShieldCheck } from 'lucide-react'
import { api, photoUrl, horoUrl } from '../lib/api'
import { useAuth } from '../lib/auth'

/**
 * Unified approvals:
 * - Inbox of members with anything pending
 * - Open member → check all items and approve / reject (or Approve all)
 */
export default function Approvals({ kind, onOpenMember }) {
  const { token } = useAuth()
  const isStories = kind === 'success-stories'
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [checked, setChecked] = useState({})
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const loadInbox = useCallback(() => {
    setLoading(true)
    const path = isStories ? '/api/admin/approvals/success-stories' : '/api/admin/approvals/pending-members'
    api(path, { token })
      .then((res) => setItems(res.items || []))
      .catch((err) => setMsg(err.message))
      .finally(() => setLoading(false))
  }, [token, isStories])

  useEffect(() => {
    loadInbox()
    setSelected(null)
    setDetail(null)
  }, [loadInbox])

  async function openMember(matriId) {
    setMsg('')
    setSelected(matriId)
    try {
      const res = await api(`/api/admin/approvals/member/${encodeURIComponent(matriId)}`, { token })
      setDetail(res)
      const init = {}
      ;(res.items || []).forEach((it) => {
        if (it.status === 'PENDING') init[it.key] = true
      })
      setChecked(init)
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function runAction(action, keys) {
    if (!selected) return
    setMsg('')
    try {
      const res = await api(`/api/admin/approvals/member/${encodeURIComponent(selected)}`, {
        method: 'POST',
        token,
        body: keys ? { action, keys } : { action },
      })
      setMsg(res.message || 'Updated')
      await openMember(selected)
      loadInbox()
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function storyAct(item, action) {
    setMsg('')
    try {
      await api(`/api/admin/approvals/success-stories/${item.story_id}`, {
        method: 'POST',
        token,
        body: { action },
      })
      loadInbox()
    } catch (err) {
      setMsg(err.message)
    }
  }

  const filtered = items.filter((m) => {
    if (!q.trim()) return true
    const t = q.trim().toLowerCase()
    return (
      String(m.matri_id || '').toLowerCase().includes(t) ||
      String(m.name || '').toLowerCase().includes(t) ||
      String(m.email || '').toLowerCase().includes(t)
    )
  })

  const selectedKeys = Object.entries(checked)
    .filter(([, v]) => v)
    .map(([k]) => k)

  if (isStories) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl text-ink-900">Success story approval</h1>
          <p className="text-sm text-ink-500">{items.length} pending</p>
        </div>
        {msg ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p> : null}
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Story</th>
                <th>Couple</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-ink-500">
                    Loading…
                  </td>
                </tr>
              ) : !items.length ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-ink-500">
                    No pending stories
                  </td>
                </tr>
              ) : (
                items.map((s) => (
                  <tr key={s.story_id}>
                    <td>{s.story_id}</td>
                    <td>
                      {s.bridename} & {s.groomname}
                    </td>
                    <td className="flex gap-1">
                      <button type="button" className="btn-ok px-2 py-1 text-xs" onClick={() => storyAct(s, 'approve')}>
                        <Check size={14} />
                      </button>
                      <button type="button" className="btn-danger px-2 py-1 text-xs" onClick={() => storyAct(s, 'reject')}>
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink-900">Member approvals</h1>
          <p className="text-sm text-ink-500">
            Open a member, check pending items, and approve — same as reviewing the full profile.
          </p>
        </div>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            className="input w-64 pl-9"
            placeholder="Search matri ID / name / email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {msg ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p> : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card overflow-hidden lg:col-span-2">
          <div className="border-b border-ink-100 px-4 py-3 text-sm font-semibold text-ink-700">
            Pending members ({filtered.length})
          </div>
          <ul className="max-h-[70vh] divide-y divide-ink-50 overflow-y-auto">
            {loading ? (
              <li className="p-6 text-center text-sm text-ink-500">Loading…</li>
            ) : !filtered.length ? (
              <li className="p-6 text-center text-sm text-ink-500">No pending approvals</li>
            ) : (
              filtered.map((m) => (
                <li key={m.matri_id}>
                  <button
                    type="button"
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-ink-50 ${
                      selected === m.matri_id ? 'bg-brand-50' : ''
                    }`}
                    onClick={() => openMember(m.matri_id)}
                  >
                    {photoUrl(m.photo1, m.gender) ? (
                      <img src={photoUrl(m.photo1, m.gender)} alt="" className="h-12 w-12 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ink-100 text-xs">—</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink-900">{m.name}</p>
                      <p className="text-xs text-brand-700">{m.matri_id}</p>
                      <p className="mt-1 text-xs text-ink-500">{m.pending?.join(' · ')}</p>
                    </div>
                    <span className="badge-warn shrink-0">{m.pendingCount}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="card space-y-4 p-4 lg:col-span-3">
          {!selected || !detail ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 text-ink-500">
              <ShieldCheck size={36} className="opacity-40" />
              <p>Select a member to review and approve all pending items</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 pb-3">
                <div>
                  <h2 className="font-display text-xl text-ink-900">{detail.matri_id}</h2>
                  <p className="text-sm text-ink-500">{detail.pendingCount} pending item(s)</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => onOpenMember?.(detail.matri_id)}
                  >
                    <Eye size={14} /> Open full profile
                  </button>
                  <button type="button" className="btn-primary" onClick={() => runAction('approve-all')}>
                    <Check size={14} /> Approve all
                  </button>
                  <button
                    type="button"
                    className="btn-ok"
                    disabled={!selectedKeys.length}
                    onClick={() => runAction('approve', selectedKeys)}
                  >
                    Approve checked ({selectedKeys.length})
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    disabled={!selectedKeys.length}
                    onClick={() => runAction('reject', selectedKeys)}
                  >
                    Reject checked
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {(detail.items || []).map((it) => (
                  <label
                    key={it.key}
                    className={`flex cursor-pointer gap-4 rounded-xl border p-3 ${
                      it.status === 'PENDING' ? 'border-amber-200 bg-amber-50/40' : 'border-ink-100 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4"
                      checked={!!checked[it.key]}
                      disabled={it.status !== 'PENDING'}
                      onChange={(e) => setChecked((c) => ({ ...c, [it.key]: e.target.checked }))}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-ink-900">{it.label}</span>
                        <span className={it.status === 'APPROVED' ? 'badge-ok' : 'badge-warn'}>{it.status}</span>
                      </div>
                      {it.type === 'image' ? (
                        <img
                          src={it.imageKind === 'horo' ? horoUrl(it.value) : photoUrl(it.value)}
                          alt=""
                          className="mt-2 max-h-40 rounded-lg border object-contain"
                        />
                      ) : (
                        <p className="whitespace-pre-wrap text-sm text-ink-700">{it.value}</p>
                      )}
                      <div className="mt-2 flex gap-2">
                        {it.status === 'PENDING' ? (
                          <>
                            <button
                              type="button"
                              className="btn-ok px-2 py-1 text-xs"
                              onClick={(e) => {
                                e.preventDefault()
                                runAction('approve', [it.key])
                              }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn-danger px-2 py-1 text-xs"
                              onClick={(e) => {
                                e.preventDefault()
                                runAction('reject', [it.key])
                              }}
                            >
                              Reject
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </label>
                ))}
                {!detail.items?.length ? (
                  <p className="text-sm text-ink-500">Nothing to approve on this profile.</p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
