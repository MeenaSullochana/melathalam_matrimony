import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import DataTable from '../components/DataTable'

const EMPTY = {
  plan_name: '',
  plan_type: 'PAID',
  plan_amount: '',
  plan_amount_type: 'Rs.',
  plan_duration: '30',
  plan_contacts: '0',
  profile: '0',
  plan_msg: '0',
  plan_sms: '0',
  video: 'No',
  chat: 'Yes',
  plan_offers: '',
  status: 'APPROVED',
}

export default function Plans({ mode = 'list' }) {
  const { token } = useAuth()
  const [plans, setPlans] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api('/api/admin/plans', { token })
      .then((res) => setPlans(res.plans || []))
      .catch((err) => setMsg(err.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  function startEdit(plan) {
    setCreating(false)
    setEditId(plan.plan_id)
    setForm({
      plan_name: plan.plan_name || '',
      plan_type: plan.plan_type || 'PAID',
      plan_amount: String(plan.plan_amount ?? ''),
      plan_amount_type: plan.plan_amount_type || 'Rs.',
      plan_duration: String(plan.plan_duration ?? '30'),
      plan_contacts: String(plan.plan_contacts ?? '0'),
      profile: String(plan.profile ?? '0'),
      plan_msg: String(plan.plan_msg ?? '0'),
      plan_sms: String(plan.plan_sms ?? '0'),
      video: plan.video || 'No',
      chat: plan.chat || 'Yes',
      plan_offers: plan.plan_offers || '',
      status: plan.status || 'APPROVED',
    })
  }

  async function save(e) {
    e.preventDefault()
    setMsg('')
    try {
      if (editId) {
        await api(`/api/admin/plans/${editId}`, { method: 'PUT', token, body: form })
        setMsg('Plan updated')
      } else {
        await api('/api/admin/plans', { method: 'POST', token, body: form })
        setMsg('Plan created')
      }
      setForm(EMPTY)
      setEditId(null)
      setCreating(false)
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this plan?')) return
    try {
      await api(`/api/admin/plans/${id}`, { method: 'DELETE', token })
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  const [creating, setCreating] = useState(false)
  const showForm = mode === 'manage' || editId || creating

  const columns = useMemo(
    () => [
      { key: 'plan_id', label: 'ID', getValue: (p) => p.plan_id },
      {
        key: 'plan_name',
        label: 'Name',
        getValue: (p) => p.plan_name,
        render: (p) => <span className="font-medium text-ink-900">{p.plan_name}</span>,
      },
      {
        key: 'plan_amount',
        label: 'Amount',
        getValue: (p) => Number(p.plan_amount) || 0,
        getExportValue: (p) => `${p.plan_amount_type || ''} ${p.plan_amount}`.trim(),
        render: (p) => (
          <span>
            {p.plan_amount_type} {p.plan_amount}
          </span>
        ),
      },
      {
        key: 'plan_duration',
        label: 'Duration',
        getValue: (p) => Number(p.plan_duration) || 0,
        getExportValue: (p) => `${p.plan_duration} days`,
        render: (p) => `${p.plan_duration} days`,
      },
      {
        key: 'profile',
        label: 'Profiles',
        getValue: (p) => Number(p.profile) || 0,
      },
      {
        key: 'plan_contacts',
        label: 'Contacts',
        getValue: (p) => Number(p.plan_contacts) || 0,
      },
      {
        key: 'status',
        label: 'Status',
        getValue: (p) => String(p.status || '').trim(),
        render: (p) => (
          <span className={String(p.status || '').trim() === 'APPROVED' ? 'badge-ok' : 'badge-warn'}>
            {String(p.status || '').trim() || '—'}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        filterable: false,
        export: false,
        render: (p) => (
          <div className="flex gap-2">
            <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => startEdit(p)}>
              <Pencil size={14} /> Edit
            </button>
            <button type="button" className="btn-danger px-2 py-1 text-xs" onClick={() => remove(p.plan_id)}>
              <Trash2 size={14} />
            </button>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      {msg ? <p className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">{msg}</p> : null}

      {showForm ? (
        <form className="card grid gap-4 p-6 sm:grid-cols-2" onSubmit={save}>
          <div className="sm:col-span-2">
            <p className="page-kicker">Package editor</p>
            <h2 className="font-display text-2xl text-ink-900">{editId ? `Edit plan #${editId}` : 'New plan'}</h2>
          </div>
          {[
            ['plan_name', 'Plan name'],
            ['plan_amount', 'Amount'],
            ['plan_duration', 'Duration (days)'],
            ['plan_contacts', 'Contact views'],
            ['profile', 'Profile views'],
            ['plan_msg', 'Messages'],
            ['plan_sms', 'SMS'],
          ].map(([key, label]) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input className="input" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.plan_type} onChange={(e) => setForm((f) => ({ ...f, plan_type: e.target.value }))}>
              <option value="PAID">Paid</option>
              <option value="FREE">Free</option>
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="APPROVED">Approved</option>
              <option value="UNAPPROVED">Hidden</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn-primary">
              {editId ? 'Update plan' : 'Create plan'}
            </button>
            {editId || creating ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setEditId(null)
                  setCreating(false)
                  setForm(EMPTY)
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      <DataTable
        title="Membership plans"
        subtitle="Create, filter, export and manage subscription packages"
        columns={columns}
        rows={plans}
        loading={loading}
        exportFileName="plans"
        searchPlaceholder="Search plan name, status…"
        toolbar={
          !showForm ? (
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setEditId(null)
                setForm(EMPTY)
                setCreating(true)
              }}
            >
              <Plus size={16} /> New plan
            </button>
          ) : null
        }
        rowKey={(p) => p.plan_id}
      />
    </div>
  )
}
