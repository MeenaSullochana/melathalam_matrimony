import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

export default function SendEmail() {
  const { token } = useAuth()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [statusFilter, setStatusFilter] = useState('Active')
  const [count, setCount] = useState(null)
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams({ limit: '1', page: '1' })
    if (statusFilter) params.set('status', statusFilter)
    api(`/api/admin/members?${params}`, { token })
      .then((res) => setCount(res.total ?? 0))
      .catch(() => setCount(null))
  }, [token, statusFilter])

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    try {
      await api('/api/admin/cms/send-email', {
        method: 'POST',
        token,
        body: { subject, body, status: statusFilter },
      })
      setMsg(`Email queued for ${count ?? 'selected'} members.`)
    } catch {
      setMsg(
        `Send API not available yet. Prepared campaign for ${count ?? 0} members (${statusFilter}) with subject "${subject}".`,
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink-900">Send email to members</h1>
        <p className="text-sm text-ink-500">Broadcast message to filtered profiles</p>
      </div>

      {msg ? <p className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">{msg}</p> : null}

      <form className="card space-y-4 p-6" onSubmit={handleSubmit}>
        <div>
          <label className="label">Recipient filter</label>
          <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All members</option>
            <option value="Active">Active</option>
            <option value="Paid">Paid</option>
            <option value="Inactive">Inactive</option>
          </select>
          {count != null ? <p className="mt-1 text-xs text-ink-500">{count} members match this filter</p> : null}
        </div>
        <div>
          <label className="label">Subject</label>
          <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} required />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea className="input min-h-[180px]" value={body} onChange={(e) => setBody(e.target.value)} required />
        </div>
        <button type="submit" className="btn-primary" disabled={busy}>
          <Send size={16} /> {busy ? 'Sending…' : 'Send email'}
        </button>
      </form>
    </div>
  )
}
