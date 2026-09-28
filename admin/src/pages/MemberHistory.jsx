import { useEffect, useState } from 'react'
import { ArrowLeft, History } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

function Table({ title, rows, cols }) {
  return (
    <section className="card space-y-3 p-4">
      <h3 className="font-display text-lg text-ink-900">{title}</h3>
      {!rows?.length ? (
        <p className="text-sm text-ink-500">No records</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-ink-500">
                {cols.map((c) => (
                  <th key={c.key} className="px-2 py-2 font-semibold">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-ink-50">
                  {cols.map((c) => (
                    <td key={c.key} className="px-2 py-2">
                      {c.render ? c.render(r) : String(r[c.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default function MemberHistory({ matriId, onBack }) {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const id = decodeURIComponent(String(matriId || '')).trim()

  useEffect(() => {
    setLoading(true)
    api(`/api/admin/members/${encodeURIComponent(id)}/history`, { token })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, token])

  if (loading) return <p className="text-sm text-ink-500">Loading history…</p>
  if (error) {
    return (
      <div className="space-y-3">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  const h = data?.history || {}
  const pkg = h.package || {}
  const m = data?.member || {}

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button type="button" className="btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1 className="flex items-center gap-2 font-display text-2xl text-ink-900">
              <History size={22} /> Member history · {m.matri_id}
            </h1>
            <p className="text-sm text-ink-500">
              {[m.firstname, m.lastname].filter(Boolean).join(' ')} · {m.email} · {m.status}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              window.location.hash = `#/members/${encodeURIComponent(id)}`
            }}
          >
            Edit profile
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              window.location.hash = `#/members/${encodeURIComponent(id)}/view`
            }}
          >
            View biodata
          </button>
        </div>
      </div>

      <section className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs uppercase text-ink-500">Package</p>
          <p className="font-semibold">{pkg.plan_name || '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-ink-500">Expiry</p>
          <p className="font-semibold">{pkg.plan_expired_on || '—'}</p>
        </div>
        <div>
          <p className="text-xs uppercase text-ink-500">Profile views used</p>
          <p className="font-semibold">
            {pkg.r_profile ?? 0} / {pkg.p_profile ?? 0}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase text-ink-500">Contacts used</p>
          <p className="font-semibold">
            {pkg.r_cnt ?? 0} / {pkg.p_no_contacts ?? 0}
          </p>
        </div>
      </section>

      <Table
        title="Payments"
        rows={h.payments}
        cols={[
          { key: 'payid', label: 'ID' },
          { key: 'plan_name', label: 'Plan' },
          { key: 'plan_amount', label: 'Amount' },
          { key: 'status', label: 'Status' },
          { key: 'pay_date', label: 'Date', render: (r) => String(r.pay_date || r.created_at || '').slice(0, 10) },
        ]}
      />
      <Table
        title="Interests sent"
        rows={h.interestsSent}
        cols={[
          { key: 'ei_id', label: 'ID' },
          { key: 'ei_receiver', label: 'To' },
          { key: 'receiver_response', label: 'Response' },
          { key: 'ei_sent_date', label: 'Date', render: (r) => String(r.ei_sent_date || '').slice(0, 10) },
        ]}
      />
      <Table
        title="Interests received"
        rows={h.interestsReceived}
        cols={[
          { key: 'ei_id', label: 'ID' },
          { key: 'ei_sender', label: 'From' },
          { key: 'receiver_response', label: 'Response' },
          { key: 'ei_sent_date', label: 'Date', render: (r) => String(r.ei_sent_date || '').slice(0, 10) },
        ]}
      />
      <Table
        title="Profiles viewed by member"
        rows={h.profilesViewed}
        cols={[
          { key: 'viewed_member_id', label: 'Viewed' },
          { key: 'viewed_date', label: 'Date', render: (r) => String(r.viewed_date || '').slice(0, 19) },
        ]}
      />
      <Table
        title="Who viewed this profile"
        rows={h.visitors}
        cols={[
          { key: 'my_id', label: 'Viewer' },
          { key: 'viewed_date', label: 'Date', render: (r) => String(r.viewed_date || '').slice(0, 19) },
        ]}
      />
      <Table
        title="Contact unlocks"
        rows={h.contacts}
        cols={[
          { key: 'viewer_id', label: 'Viewer' },
          { key: 'viewed_id', label: 'Contact of' },
          { key: 'viewed_date', label: 'Date', render: (r) => String(r.viewed_date || '').slice(0, 19) },
        ]}
      />
      <Table
        title="Renewal requests"
        rows={h.renewals}
        cols={[
          { key: 'rr_id', label: 'ID' },
          { key: 'plan_name', label: 'Plan' },
          { key: 'status', label: 'Status' },
          { key: 'created_at', label: 'Requested', render: (r) => String(r.created_at || '').slice(0, 10) },
        ]}
      />
    </div>
  )
}
