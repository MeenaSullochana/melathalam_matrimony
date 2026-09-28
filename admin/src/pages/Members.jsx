import { useCallback, useEffect, useMemo, useState } from 'react'
import { Eye, Pencil, Plus, Printer, Star, Trash2, History, Ban, MoreHorizontal } from 'lucide-react'
import { api, photoUrl } from '../lib/api'
import { useAuth } from '../lib/auth'
import DataTable from '../components/DataTable'

function memberName(m) {
  return [m.firstname, m.lastname].filter(Boolean).join(' ') || m.username || '—'
}

function fmtDate(v) {
  if (!v) return '—'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return String(v).slice(0, 10)
  return d.toLocaleDateString()
}

function ActionBtn({ title, onClick, tone = 'secondary', children }) {
  const tones = {
    secondary: 'btn-secondary',
    primary: 'btn-primary',
    ok: 'btn-ok',
    danger: 'btn-danger',
  }
  return (
    <button
      type="button"
      className={`${tones[tone] || tones.secondary} px-2 py-1.5 text-xs`}
      title={title}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
    >
      {children}
    </button>
  )
}

export default function Members({ onOpen, onAdd, onView, onPrint, onHistory, presetStatus, presetFeatured, mode, renewMode }) {
  const { token } = useAuth()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(presetStatus || '')
  const [gender, setGender] = useState('')
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [plans, setPlans] = useState([])
  const [planPick, setPlanPick] = useState({})
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [menuOpen, setMenuOpen] = useState(null)
  const planMode = mode === 'plans'

  const title = useMemo(() => {
    if (planMode) return 'Change membership plan'
    if (presetFeatured) return 'Featured profiles'
    if (presetStatus === 'Active') return 'Active to paid'
    if (renewMode || presetStatus === 'Paid') return 'Renew membership'
    if (status) return `Members · ${status}`
    return 'All members'
  }, [presetStatus, presetFeatured, status, planMode, renewMode])

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: String(pageSize) })
    const effectiveStatus = presetStatus || status
    if (renewMode) params.set('renew', '1')
    else if (effectiveStatus) params.set('status', effectiveStatus)
    if (presetFeatured) params.set('fstatus', 'Featured')
    if (planMode && !effectiveStatus && !renewMode) params.set('status', 'Paid')
    if (search) params.set('q', search)
    if (gender) params.set('gender', gender)
    api(`/api/admin/members?${params}`, { token })
      .then((res) => {
        setRows(res.members || [])
        setTotal(res.total || 0)
      })
      .catch((err) => setMsg(err.message))
      .finally(() => setLoading(false))
  }, [token, page, pageSize, search, status, gender, presetStatus, presetFeatured, planMode, renewMode])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (presetStatus) setStatus(presetStatus)
  }, [presetStatus])

  useEffect(() => {
    if (!planMode) return
    api('/api/admin/plans', { token })
      .then((res) => setPlans(res.plans || []))
      .catch(() => {})
  }, [planMode, token])

  async function setMemberStatus(matriId, nextStatus) {
    setMsg('')
    try {
      await api(`/api/admin/members/${encodeURIComponent(String(matriId).trim())}/status`, {
        method: 'PATCH',
        token,
        body: { status: nextStatus },
      })
      setMsg(`Updated ${matriId} → ${nextStatus}`)
      setMenuOpen(null)
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function setFeatured(matriId, featured) {
    setMsg('')
    try {
      await api(`/api/admin/members/${encodeURIComponent(String(matriId).trim())}/status`, {
        method: 'PATCH',
        token,
        body: { fstatus: featured ? 'Featured' : '' },
      })
      setMsg(featured ? `${matriId} marked Featured` : `${matriId} removed from Featured`)
      setMenuOpen(null)
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function assignPlan(matriId) {
    const planId = planPick[matriId]
    const plan = plans.find((p) => String(p.plan_id) === String(planId))
    if (!plan) {
      setMsg('Select a plan first')
      return
    }
    setMsg('')
    try {
      const days = Number(plan.plan_duration || plan.plan_expired || 30)
      const exp = new Date()
      exp.setDate(exp.getDate() + (Number.isFinite(days) ? days : 30))
      await api(`/api/admin/members/${encodeURIComponent(String(matriId).trim())}/plan`, {
        method: 'PATCH',
        token,
        body: {
          plan_id: plan.plan_id,
          plan_name: plan.plan_name,
          plan_status: 'Active',
          plan_expired_on: exp.toISOString().slice(0, 10),
        },
      })
      setMsg(`Plan "${plan.plan_name}" assigned to ${matriId}`)
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function removeMember(matriId) {
    if (!window.confirm(`Delete member ${matriId}?`)) return
    try {
      await api(`/api/admin/members/${encodeURIComponent(String(matriId).trim())}`, {
        method: 'DELETE',
        token,
      })
      setMsg('Member deleted')
      setMenuOpen(null)
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  const openId = (id) => String(id || '').trim()

  const columns = useMemo(() => {
    const cols = [
      {
        key: 'photo',
        label: 'Photo',
        sortable: false,
        filterable: false,
        export: false,
        render: (m) => (
          <img
            src={photoUrl(m.photo1, m.gender)}
            alt=""
            className="h-11 w-11 rounded-xl object-cover ring-1 ring-ink-200 shadow-sm"
          />
        ),
      },
      {
        key: 'matri_id',
        label: 'Matri ID',
        getValue: (m) => openId(m.matri_id),
        render: (m) => (
          <button
            type="button"
            className="font-semibold text-brand-700 hover:underline"
            onClick={() => onView?.(openId(m.matri_id))}
          >
            {openId(m.matri_id)}
          </button>
        ),
      },
      {
        key: 'name',
        label: 'Name',
        getValue: memberName,
        getExportValue: memberName,
        render: (m) => (
          <div>
            <p className="font-medium text-ink-900">{memberName(m)}</p>
            <p className="text-xs text-ink-500">{m.gender || '—'} · {m.city || m.state_id || '—'}</p>
          </div>
        ),
      },
      {
        key: 'email',
        label: 'Contact',
        getValue: (m) => m.email || '',
        getExportValue: (m) => [m.email, m.mobile].filter(Boolean).join(' / '),
        render: (m) => (
          <div className="text-ink-600">
            <div>{m.email || '—'}</div>
            <div className="text-xs text-ink-500">{m.mobile || ''}</div>
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        getValue: (m) => m.status || '',
        getExportValue: (m) => [m.status, m.fstatus].filter(Boolean).join(' · '),
        render: (m) => (
          <div className="flex flex-wrap items-center gap-1">
            <span className={m.status === 'Paid' || m.status === 'Active' ? 'badge-ok' : 'badge-warn'}>
              {m.status || '—'}
            </span>
            {m.fstatus === 'Featured' ? (
              <span className="badge border-amber-200 bg-amber-50 text-amber-700">
                <Star size={10} className="mr-1" /> Featured
              </span>
            ) : null}
          </div>
        ),
      },
      {
        key: 'reg_date',
        label: 'Registered',
        getValue: (m) => m.reg_date || '',
        getExportValue: (m) => fmtDate(m.reg_date),
        render: (m) => <span className="text-ink-500">{fmtDate(m.reg_date)}</span>,
      },
    ]

    if (planMode) {
      cols.push({
        key: 'plan',
        label: 'Plan',
        getValue: (m) => m.plan_name || '',
        getExportValue: (m) => `${m.plan_name || ''} ${m.plan_expired_on || ''}`.trim(),
        render: (m) => (
          <div className="text-xs text-ink-600">
            {m.plan_name || m.plan_id || '—'}
            {m.plan_expired_on ? <div className="text-ink-500">Exp {m.plan_expired_on}</div> : null}
          </div>
        ),
      })
    }

    cols.push({
      key: 'actions',
      label: 'Actions',
      sortable: false,
      filterable: false,
      export: false,
      render: (m) => {
        const mid = openId(m.matri_id)
        if (planMode) {
          return (
            <div className="flex flex-wrap gap-1.5">
              <select
                className="input w-36 py-1 text-xs"
                value={planPick[mid] || ''}
                onChange={(e) => setPlanPick((p) => ({ ...p, [mid]: e.target.value }))}
              >
                <option value="">Select plan</option>
                {plans.map((p) => (
                  <option key={p.plan_id} value={p.plan_id}>
                    {p.plan_name}
                  </option>
                ))}
              </select>
              <ActionBtn title="Assign" tone="primary" onClick={() => assignPlan(mid)}>
                Assign
              </ActionBtn>
            </div>
          )
        }
        return (
          <div className="relative flex flex-wrap items-center gap-1">
            <ActionBtn title="View" onClick={() => onView?.(mid)}>
              <Eye size={14} />
            </ActionBtn>
            <ActionBtn title="Edit" onClick={() => onOpen?.(mid)}>
              <Pencil size={14} />
            </ActionBtn>
            <ActionBtn title="More" onClick={(e) => { e?.stopPropagation?.(); setMenuOpen(menuOpen === mid ? null : mid) }}>
              <MoreHorizontal size={14} />
            </ActionBtn>
            {menuOpen === mid ? (
              <div
                className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-ink-200 bg-white p-1.5 shadow-premium"
                onClick={(e) => e.stopPropagation()}
              >
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-ink-50" onClick={() => onHistory?.(mid)}>
                  <History size={13} /> History
                </button>
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-ink-50" onClick={() => onPrint?.(mid)}>
                  <Printer size={13} /> Print
                </button>
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-ink-50" onClick={() => setMemberStatus(mid, 'Paid')}>
                  Mark Paid
                </button>
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-ink-50" onClick={() => setMemberStatus(mid, 'Inactive')}>
                  <Ban size={13} /> Inactive
                </button>
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs hover:bg-ink-50" onClick={() => setFeatured(mid, m.fstatus !== 'Featured')}>
                  <Star size={13} /> {m.fstatus === 'Featured' ? 'Unfeature' : 'Feature'}
                </button>
                <button type="button" className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-red-600 hover:bg-red-50" onClick={() => removeMember(mid)}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            ) : null}
          </div>
        )
      },
    })

    return cols
  }, [planMode, plans, planPick, menuOpen, onView, onOpen, onHistory, onPrint])

  const filters = []
  if (!presetStatus && !presetFeatured && !planMode && !renewMode) {
    filters.push({
      key: 'status',
      label: 'All status',
      value: status,
      onChange: (v) => {
        setStatus(v)
        setPage(1)
      },
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Paid', label: 'Paid' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Suspended', label: 'Suspended' },
      ],
    })
  }
  filters.push({
    key: 'gender',
    label: 'All gender',
    value: gender,
    onChange: (v) => {
      setGender(v)
      setPage(1)
    },
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
    ],
  })

  return (
    <div className="space-y-4" onClick={() => menuOpen && setMenuOpen(null)}>
      {msg ? (
        <p className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">{msg}</p>
      ) : null}

      <DataTable
        title={title}
        subtitle={`${total.toLocaleString()} profiles · filter, sort, export & paginate`}
        columns={columns}
        rows={rows}
        loading={loading}
        serverSide
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        search={q}
        onSearchChange={setQ}
        onSearchSubmit={() => {
          setPage(1)
          setSearch(q.trim())
        }}
        searchPlaceholder="Matri ID, name, email, mobile…"
        filters={filters}
        exportFileName="members"
        toolbar={
          !planMode && !presetFeatured ? (
            <button type="button" className="btn-primary" onClick={() => onAdd?.()}>
              <Plus size={16} /> Add member
            </button>
          ) : null
        }
        rowKey={(m) => openId(m.matri_id)}
      />
    </div>
  )
}
