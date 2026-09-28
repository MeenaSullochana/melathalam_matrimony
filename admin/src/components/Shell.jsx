import { useEffect, useMemo, useState } from 'react'
import {
  LayoutDashboard,
  Users,
  Settings,
  Database,
  BadgeCheck,
  CreditCard,
  Activity,
  Mail,
  BarChart3,
  Send,
  ChevronDown,
  LogOut,
  Heart,
  Menu,
  X,
  MessageSquare,
  Briefcase,
} from 'lucide-react'
import { NAV } from '../lib/nav'
import { useAuth } from '../lib/auth'
import { api, resolveSiteLogo } from '../lib/api'
import brandLogo from '../assets/logo.png'

const ICONS = {
  dashboard: LayoutDashboard,
  'site-settings': Settings,
  master: Database,
  members: Users,
  match: Heart,
  plans: CreditCard,
  approvals: BadgeCheck,
  'website-content': Briefcase,
  enquiries: MessageSquare,
  activity: Activity,
  'email-templates': Mail,
  payment: CreditCard,
  reports: BarChart3,
  'send-email': Send,
}

export default function Shell({ route, onNavigate, children }) {
  const { admin, logout, token } = useAuth()
  const [open, setOpen] = useState({})
  const [mobile, setMobile] = useState(false)
  const [logoSrc, setLogoSrc] = useState(brandLogo)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await api('/api/admin/settings/site', { token })
        if (!cancelled) setLogoSrc(resolveSiteLogo(res.config, brandLogo))
      } catch {
        if (!cancelled) setLogoSrc(brandLogo)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  const activePath = route.raw || 'dashboard'
  const groups = useMemo(() => NAV, [])

  function toggle(id) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function go(path) {
    onNavigate(path)
    setMobile(false)
  }

  const pageTitle = useMemo(() => {
    for (const item of groups) {
      if (!item.children && (activePath === item.path || (item.path === 'dashboard' && (!activePath || activePath === 'dashboard')))) {
        return item.label
      }
      if (item.children) {
        const child = item.children.find((c) => activePath === c.path || activePath.startsWith(c.path.split('?')[0]))
        if (child) return child.label
        if (activePath.startsWith(item.id)) return item.label
      }
    }
    if (activePath.startsWith('members')) return 'Members'
    return 'Admin'
  }, [activePath, groups])

  const Sidebar = (
    <aside className="relative flex h-full w-[288px] flex-col overflow-hidden bg-ink-950 text-white">
      <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-brand-600/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-24 h-40 w-40 rounded-full bg-accent-500/20 blur-3xl" />

      <div className="relative border-b border-white/10 px-4 py-5">
        <div className="rounded-xl bg-white px-3 py-3">
          <img
            src={logoSrc}
            alt="Melathalam Matrimony"
            className="mx-auto h-12 w-auto max-w-full object-contain"
          />
        </div>
      </div>

      <nav className="relative flex-1 overflow-y-auto px-3 py-4">
        {groups.map((item) => {
          const Icon = ICONS[item.id] || LayoutDashboard
          if (!item.children) {
            const active = activePath === item.path || (item.path === 'dashboard' && (!activePath || activePath === 'dashboard'))
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.path)}
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-lg shadow-brand-900/40'
                    : 'text-white/65 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            )
          }
          const childActive = item.children.some((c) => activePath.startsWith(c.path.split('?')[0]))
          const expanded = open[item.id] ?? childActive
          return (
            <div key={item.id} className="mb-1">
              <button
                type="button"
                onClick={() => toggle(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  childActive ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span className="flex-1">{item.label}</span>
                <ChevronDown size={14} className={`opacity-60 transition ${expanded ? 'rotate-180' : ''}`} />
              </button>
              {expanded ? (
                <div className="ml-3 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                  {item.children.map((child) => {
                    const base = child.path.split('?')[0]
                    const active = activePath === child.path || activePath.startsWith(base)
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => go(child.path)}
                        className={`block w-full rounded-lg px-3 py-2 text-left text-xs transition ${
                          active
                            ? 'bg-accent-500/90 font-semibold text-ink-950'
                            : 'text-white/50 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        {child.label}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          )
        })}
      </nav>

      <div className="relative m-3 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
        <p className="text-xs font-semibold text-white">{admin?.uname || 'Admin'}</p>
        <p className="truncate text-[11px] text-white/45">{admin?.email || '—'}</p>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/15"
          onClick={() => {
            logout()
            go('login')
          }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="admin-chrome hidden h-full shrink-0 lg:block print:hidden">{Sidebar}</div>
      {mobile ? (
        <div className="admin-chrome fixed inset-0 z-40 flex lg:hidden print:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobile(false)} />
          <div className="relative z-10 h-full shadow-2xl">{Sidebar}</div>
        </div>
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="admin-chrome z-20 flex shrink-0 items-center justify-between border-b border-ink-200/80 bg-white/90 px-4 py-3.5 backdrop-blur-xl md:px-8 print:hidden">
          <div className="flex items-center gap-3">
            <button type="button" className="rounded-xl border border-ink-200 bg-white p-2 shadow-sm lg:hidden" onClick={() => setMobile(true)}>
              {mobile ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <p className="page-kicker">Control center</p>
              <p className="font-display text-xl text-ink-900">{pageTitle}</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right text-sm">
              <p className="font-semibold text-ink-800">{admin?.uname}</p>
              <p className="text-xs text-ink-500">{admin?.email}</p>
            </div>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 md:px-8 print:overflow-visible print:p-0">{children}</main>
      </div>
    </div>
  )
}
