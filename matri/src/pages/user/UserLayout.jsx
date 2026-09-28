import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  UserRound,
  Search,
  HeartHandshake,
  Crown,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../../auth'
import { loadSiteDefaults, photoUrl, resolveSiteLogo } from '../../api'
import brandLogo from '../../assets/logo/logo.png'
import './UserLayout.css'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profile', label: 'My Profile', icon: UserRound },
  { id: 'matches', label: 'Search / Matches', icon: Search },
  { id: 'interests', label: 'Interests', icon: HeartHandshake },
  { id: 'upgrade', label: 'Membership', icon: Crown },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function UserLayout({ currentPage, onNavigate, children }) {
  const [open, setOpen] = useState(false)
  const [logoSrc, setLogoSrc] = useState(brandLogo)
  const { member, logout } = useAuth()

  useEffect(() => {
    let cancelled = false
    loadSiteDefaults().then((config) => {
      if (!cancelled) setLogoSrc(resolveSiteLogo(config, brandLogo))
    })
    return () => {
      cancelled = true
    }
  }, [])

  const go = (id) => {
    setOpen(false)
    onNavigate(id)
  }

  const onLogout = async () => {
    setOpen(false)
    await logout()
    onNavigate('login')
  }

  const displayName =
    member?.username ||
    `${member?.firstname || ''} ${member?.lastname || ''}`.trim() ||
    'Member'
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] || '')
    .join('')
    .toUpperCase()

  return (
    <div className="user-app">
      <aside className={`user-sidebar ${open ? 'user-sidebar--open' : ''}`}>
        <button type="button" className="user-sidebar__brand" onClick={() => go('dashboard')}>
          <span className="user-sidebar__logo-wrap">
            <img src={logoSrc} alt="Melathalam Matrimony" className="user-sidebar__logo" />
          </span>
        </button>

        <nav className="user-sidebar__nav" aria-label="Member navigation">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`user-sidebar__link ${currentPage === id ? 'is-active' : ''}`}
              onClick={() => go(id)}
            >
              <Icon size={18} strokeWidth={1.85} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="user-sidebar__logout" onClick={onLogout}>
          <LogOut size={18} strokeWidth={1.85} />
          <span>Logout</span>
        </button>
      </aside>

      <div className="user-main">
        <header className="user-topbar">
          <button type="button" className="user-topbar__menu" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="user-topbar__user">
            {member?.photo1 ? (
              <img src={photoUrl(member.photo1, member.gender)} alt="" className="user-topbar__avatar" />
            ) : (
              <span className="user-topbar__initials">{initials || 'M'}</span>
            )}
            <div>
              <p className="user-topbar__name">{displayName}</p>
              <p className="user-topbar__id">{member?.matri_id || ''}</p>
            </div>
          </div>
        </header>
        <div className="user-content">{children}</div>
      </div>
      {open ? <button type="button" className="user-sidebar__backdrop" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
    </div>
  )
}
