import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

export default function Renewals({ onOpen }) {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    api('/api/admin/members/renewals', { token })
      .then((r) => setItems(r.items || []))
      .catch((e) => setMsg(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [token])

  async function decide(rrId, action) {
    setMsg('')
    try {
      const res = await api(`/api/admin/members/renewals/${rrId}/decide`, {
        method: 'POST',
        token,
        body: { action },
      })
      setMsg(res.message || 'Done')
      load()
    } catch (e) {
      setMsg(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink-900">Membership renewal requests</h1>
        <p className="text-sm text-ink-500">Approve or reject member renewal requests</p>
      </div>
      {msg ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p> : null}
      <div className="card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Member</th>
              <th>Plan</th>
              <th>Note</th>
              <th>Status</th>
              <th>Requested</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-ink-500">
                  Loading…
                </td>
              </tr>
            ) : !items.length ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-ink-500">
                  No renewal requests
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r.rr_id}>
                  <td>{r.rr_id}</td>
                  <td>
                    <button type="button" className="text-brand-700 underline" onClick={() => onOpen?.(r.matri_id)}>
                      {r.matri_id}
                    </button>
                    <div className="text-xs text-ink-500">
                      {[r.member?.firstname, r.member?.lastname].filter(Boolean).join(' ')}
                    </div>
                  </td>
                  <td>{r.plan_name || '—'}</td>
                  <td className="max-w-[200px] truncate">{r.note || '—'}</td>
                  <td>{r.status}</td>
                  <td>{String(r.created_at || '').slice(0, 10)}</td>
                  <td>
                    {r.status === 'Pending' ? (
                      <div className="flex gap-1">
                        <button type="button" className="btn-primary px-2 py-1 text-xs" onClick={() => decide(r.rr_id, 'approve')}>
                          <Check size={14} /> Approve
                        </button>
                        <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => decide(r.rr_id, 'reject')}>
                          <X size={14} /> Reject
                        </button>
                      </div>
                    ) : (
                      '—'
                    )}
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
