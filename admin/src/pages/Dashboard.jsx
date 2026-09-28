import { useEffect, useState } from 'react'
import { Users, BadgeCheck, CreditCard, Heart, Star, ArrowUpRight } from 'lucide-react'
import { api, photoUrl } from '../lib/api'
import { useAuth } from '../lib/auth'
import DataTable from '../components/DataTable'

function StatCard({ icon: Icon, label, value, tone = 'brand' }) {
  const tones = {
    brand: 'from-brand-600/15 to-brand-700/5 text-brand-800',
    ok: 'from-emerald-500/15 to-emerald-600/5 text-emerald-800',
    warn: 'from-accent-500/20 to-accent-600/5 text-accent-700',
  }
  return (
    <div className="card relative overflow-hidden p-5">
      <div className={`absolute inset-0 bg-gradient-to-br ${tones[tone] || tones.brand} opacity-80`} />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-500">{label}</p>
          <p className="mt-2 font-display text-3xl text-ink-900">{value ?? '—'}</p>
        </div>
        <div className="rounded-xl bg-white/80 p-2.5 shadow-sm ring-1 ring-ink-200/60">
          <Icon size={18} className="text-brand-700" />
        </div>
      </div>
    </div>
  )
}

function memberName(m) {
  return [m.firstname, m.lastname].filter(Boolean).join(' ') || m.username || '—'
}

export default function Dashboard({ onOpenMember }) {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api('/api/admin/dashboard/stats', { token })
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  if (loading) {
    return (
      <p className="flex items-center gap-2 text-sm text-ink-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        Loading dashboard…
      </p>
    )
  }
  if (error) return <p className="text-sm text-red-600">{error}</p>

  const s = data?.stats || {}
  const latest = data?.latest || []

  const columns = [
    {
      key: 'photo',
      label: 'Photo',
      sortable: false,
      filterable: false,
      export: false,
      render: (m) => (
        <img src={photoUrl(m.photo1, m.gender)} alt="" className="h-10 w-10 rounded-xl object-cover ring-1 ring-ink-200" />
      ),
    },
    {
      key: 'matri_id',
      label: 'Profile ID',
      getValue: (m) => String(m.matri_id || '').trim(),
      render: (m) => (
        <button type="button" className="font-semibold text-brand-700 hover:underline" onClick={() => onOpenMember?.(String(m.matri_id || '').trim())}>
          {String(m.matri_id || '').trim()}
        </button>
      ),
    },
    { key: 'name', label: 'Name', getValue: memberName },
    { key: 'gender', label: 'Gender', getValue: (m) => m.gender || '' },
    {
      key: 'status',
      label: 'Status',
      getValue: (m) => m.status || '',
      render: (m) => (
        <span className={m.status === 'Paid' || m.status === 'Active' ? 'badge-ok' : 'badge-warn'}>{m.status || '—'}</span>
      ),
    },
    {
      key: 'reg_date',
      label: 'Registered',
      getValue: (m) => m.reg_date || '',
      getExportValue: (m) => (m.reg_date ? new Date(m.reg_date).toLocaleString() : ''),
      render: (m) => <span className="text-ink-500">{m.reg_date ? new Date(m.reg_date).toLocaleString() : '—'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      filterable: false,
      export: false,
      render: (m) => (
        <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => onOpenMember?.(String(m.matri_id || '').trim())}>
          <ArrowUpRight size={14} /> Open
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="page-kicker">Overview</p>
        <h1 className="font-display text-3xl text-ink-900">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">Members, approvals, and live activity at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="All members" value={s.allMembers} />
        <StatCard icon={Users} label="Active" value={s.activeMembers} tone="ok" />
        <StatCard icon={CreditCard} label="Paid" value={s.paidMembers} tone="ok" />
        <StatCard icon={Star} label="Featured" value={s.featuredMembers} tone="warn" />
        <StatCard icon={BadgeCheck} label="Pending photos" value={s.pendingPhotos} tone="warn" />
        <StatCard icon={BadgeCheck} label="About me queue" value={s.pendingAbout} tone="warn" />
        <StatCard icon={BadgeCheck} label="Aadhaar queue" value={s.pendingAadhaar} tone="warn" />
        <StatCard icon={BadgeCheck} label="Horoscope queue" value={s.pendingHoroscope} tone="warn" />
        <StatCard icon={CreditCard} label="Plans" value={s.plans} />
        <StatCard icon={Heart} label="Interests" value={s.interests} />
        <StatCard icon={Heart} label="Success stories" value={s.stories} />
      </div>

      <DataTable
        title="Latest members"
        subtitle="Most recently registered profiles"
        columns={columns}
        rows={latest}
        loading={false}
        exportFileName="latest-members"
        searchPlaceholder="Filter latest members…"
        rowKey={(m) => m.matri_id || m.index_id}
      />
    </div>
  )
}
