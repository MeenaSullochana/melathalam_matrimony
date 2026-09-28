import { useState, useEffect } from 'react'
import {
  User,
  UserPlus,
  Menu,
  X,
  Home,
  Heart,
  Info,
  Crown,
  Phone,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react'
import brandLogo from '../assets/logo/logo.png'
import { loadSiteDefaults, resolveSiteLogo } from '../api'
import './Navbar.css'

const links = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'about', label: 'About Us', icon: Info },
  { id: 'services', label: 'Services', icon: Sparkles },
  { id: 'stories', label: 'Success Stories', icon: Heart },
  { id: 'membership', label: 'Membership', icon: Crown },
  { id: 'contact', label: 'Contact Us', icon: Phone },
]

const contactInfo = [
  { icon: Phone, label: '+91 97909 05844', href: 'tel:+919790905844' },
  { icon: Mail, label: 'info@kalyanamatrimonial.com', href: 'mailto:info@kalyanamatrimonial.com' },
  { icon: MapPin, label: 'Anna Nagar, Chennai - 600 040', href: '#contact' },
]

function BrandLogo({ className = 'logo-mark' }) {
  const [src, setSrc] = useState(brandLogo)

  useEffect(() => {
    let cancelled = false
    loadSiteDefaults().then((config) => {
      if (!cancelled) setSrc(resolveSiteLogo(config, brandLogo))
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <img
      src={src}
      alt="Melathalam Matrimony"
      className={className}
      width={280}
      height={64}
      decoding="async"
      onError={() => {
        if (src !== brandLogo) setSrc(brandLogo)
      }}
    />
  )
}

export default function Navbar({ currentPage = 'home', onNavigate }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const go = (id) => {
    setOpen(false)
    onNavigate?.(id)
  }

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${open ? 'navbar--menu-open' : ''}`}>
      <div className="navbar__inner container">
        <a
          href="#/"
          className="navbar__brand"
          onClick={(e) => {
            e.preventDefault()
            go('home')
          }}
        >
          <BrandLogo />
        </a>

        <nav className="navbar__links" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.id === 'home' ? '#/' : `#/${link.id}`}
              className={currentPage === link.id ? 'is-active' : undefined}
              onClick={(e) => {
                e.preventDefault()
                go(link.id)
              }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <button type="button" className="btn btn-login navbar__login" onClick={() => go('login')}>
            <User size={16} strokeWidth={2} aria-hidden="true" />
            Login
          </button>
          <button type="button" className="btn btn-primary" onClick={() => go('register')}>
            <UserPlus size={16} strokeWidth={2} aria-hidden="true" />
            Register Free
          </button>
          <button
            type="button"
            className="navbar__menu-btn"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div className={`navbar__drawer ${open ? 'is-open' : ''}`}>
        <div className="navbar__drawer-top">
          <div className="navbar__drawer-brand">
            <BrandLogo className="logo-mark logo-mark--drawer" />
          </div>
          <button
            type="button"
            className="navbar__drawer-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="navbar__drawer-nav" aria-label="Mobile">
          {links.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={id === 'home' ? '#/' : `#/${id}`}
              className={currentPage === id ? 'is-active' : undefined}
              onClick={(e) => {
                e.preventDefault()
                go(id)
              }}
            >
              <span className="navbar__drawer-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={2} />
              </span>
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="navbar__drawer-contact">
          <p className="navbar__drawer-contact-title">Get in Touch</p>
          {contactInfo.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href === '#contact' ? '#/contact' : href}
              className="navbar__drawer-contact-item"
              onClick={(e) => {
                if (href === '#contact') {
                  e.preventDefault()
                  go('contact')
                }
              }}
            >
              <span className="navbar__drawer-icon" aria-hidden="true">
                <Icon size={16} strokeWidth={2} />
              </span>
              <span>{label}</span>
            </a>
          ))}
        </div>

        <div className="navbar__drawer-actions">
          <button type="button" className="btn btn-login" onClick={() => go('login')}>
            <User size={16} strokeWidth={2} aria-hidden="true" />
            Login
          </button>
          <button type="button" className="btn btn-primary" onClick={() => go('register')}>
            <UserPlus size={16} strokeWidth={2} aria-hidden="true" />
            Register Free
          </button>
        </div>
      </div>
      {open && (
        <button
          type="button"
          className="navbar__backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      )}
    </header>
  )
}
