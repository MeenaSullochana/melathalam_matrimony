import { useCallback, useEffect, useMemo, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import DataTable from '../components/DataTable'

function formatDate(v) {
  if (!v) return '—'
  try {
    return new Date(v).toLocaleString()
  } catch {
    return String(v)
  }
}

export default function Enquiries() {
  const { token } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api('/api/admin/cms/first-form?source=enquiry', { token })
      .then((res) => setRows(res.leads || []))
      .catch((err) => setMsg(err.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  async function remove(id) {
    if (!window.confirm('Delete this enquiry?')) return
    setMsg('')
    try {
      await api(`/api/admin/cms/first-form/${id}`, { method: 'DELETE', token })
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  const columns = useMemo(
    () => [
      { key: 'id', label: 'ID', getValue: (r) => r.id },
      {
        key: 'name',
        label: 'Name',
        getValue: (r) => [r.first_name, r.last_name].filter(Boolean).join(' ') || '—',
        render: (r) => (
          <span className="font-medium text-ink-900">
            {[r.first_name, r.last_name].filter(Boolean).join(' ') || '—'}
          </span>
        ),
      },
      { key: 'phone', label: 'Phone', getValue: (r) => r.mobile_no || '—' },
      {
        key: 'source',
        label: 'Source',
        getValue: (r) => r.source || r.form_type || 'enquiry',
        render: (r) => (
          <span className="badge-muted">{r.source || r.form_type || 'enquiry'}</span>
        ),
      },
      {
        key: 'message',
        label: 'Message',
        getValue: (r) => r.address || '—',
        render: (r) => <span className="max-w-xs truncate block">{r.address || '—'}</span>,
      },
      {
        key: 'created',
        label: 'Received',
        getValue: (r) => formatDate(r.createdAt),
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        filterable: false,
        export: false,
        render: (r) => (
          <button type="button" className="btn-danger px-2 py-1 text-xs" onClick={() => remove(r.id)}>
            <Trash2 size={14} />
          </button>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <div>
        <p className="page-kicker">Leads</p>
        <h1 className="font-display text-2xl text-ink-900">Quick enquiries</h1>
        <p className="text-sm text-ink-500">Submitted from Quick Enquiry and Contact forms</p>
      </div>
      {msg ? <p className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">{msg}</p> : null}
      <DataTable
        title="Enquiries"
        subtitle={`${rows.length} records · search, filter, sort & CSV export`}
        columns={columns}
        rows={rows}
        loading={loading}
        exportFileName="enquiries"
        searchPlaceholder="Search name, phone, message…"
        rowKey={(r) => String(r.id || r._id)}
      />
    </div>
  )
}
