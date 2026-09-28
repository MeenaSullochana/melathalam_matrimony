import { useMemo } from 'react'
import { Mail, MapPin, Phone, MessageCircle } from 'lucide-react'
import InstagramGallery from './InstagramGallery'
import footerLogo from '../assets/logo/footer.png'
import { useT } from '../i18n/LanguageContext'
import LanguageSwitcher from './LanguageSwitcher'
import './Footer.css'

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  )
}

function YoutubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12.2c0-2.2-.2-3.7-.4-4.5-.2-.8-.7-1.4-1.4-1.6C19 5.7 12 5.7 12 5.7s-7 0-8.2.4c-.7.2-1.2.8-1.4 1.6-.2.8-.4 2.3-.4 4.5s.2 3.7.4 4.5c.2.8.7 1.4 1.4 1.6 1.2.4 8.2.4 8.2.4s7 0 8.2-.4c.7-.2 1.2-.8 1.4-1.6.2-.8.4-2.3.4-4.5zM10 15.2V9.2l5.2 3-5.2 3z" />
    </svg>
  )
}

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com', Icon: FacebookIcon },
  { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
  { label: 'YouTube', href: 'https://youtube.com', Icon: YoutubeIcon },
]

function BrandLogo() {
  return (
    <img
      src={footerLogo}
      alt="Melathalam Matrimony"
      className="logo-mark"
      width={300}
      height={72}
      decoding="async"
    />
  )
}

export default function Footer({ onNavigate }) {
  const t = useT()
  const year = new Date().getFullYear()

  const quickLinks = useMemo(
    () => [
      { id: 'home', label: t('nav.home') },
      { id: 'services', label: t('nav.services') },
      { id: 'about', label: t('nav.about') },
      { id: 'membership', label: t('nav.membership') },
      { id: 'contact', label: t('nav.contact') },
      { id: 'register', label: t('footer.registration') },
      { id: 'login', label: t('common.login') },
    ],
    [t],
  )

  const policyLinks = useMemo(
    () => [
      { section: 'safety', label: t('footer.safety') },
      { section: 'download-app', label: t('footer.downloadApp') },
      { id: 'terms', label: t('footer.terms') },
      { id: 'privacy', label: t('footer.privacy') },
      { id: 'report-misuse', label: t('footer.report') },
      { id: 'refund', label: t('footer.refund') },
      { section: 'faq', label: t('footer.faq') },
    ],
    [t],
  )

  const contactItems = [
    {
      icon: MapPin,
      label: 'No: 37, 2nd Avenue, Anna Nagar, Chennai - 600 040',
      href: '#/contact',
    },
    {
      icon: Mail,
      label: 'info@kalyanamatrimonial.com',
      href: 'mailto:info@kalyanamatrimonial.com',
    },
    {
      icon: Mail,
      label: 'support@kalyanamatrimonial.com',
      href: 'mailto:support@kalyanamatrimonial.com',
    },
    {
      icon: Phone,
      label: '+91 97909 05844',
      href: 'tel:+919790905844',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp: +91 97909 05844',
      href: 'https://wa.me/919790905844',
      external: true,
    },
  ]

  const go = (id) => {
    onNavigate?.(id)
  }

  const goSection = (sectionId) => {
    const scroll = () => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const hash = window.location.hash.replace(/^#\/?/, '').split(/[/?#]/)[0]
    const onHome = !hash || hash === 'home'

    if (onHome) {
      scroll()
      return
    }

    go('home')
    window.setTimeout(scroll, 120)
  }

  return (
    <footer className="site-footer">
      <InstagramGallery />
      <div className="site-footer__glow" aria-hidden="true" />
      <div className="container site-footer__inner">
        <div className="site-footer__col site-footer__col--about">
          <h3 className="site-footer__heading">{t('footer.about')}</h3>
          <a
            href="#/"
            className="site-footer__logo"
            onClick={(e) => {
              e.preventDefault()
              go('home')
            }}
          >
            <BrandLogo />
          </a>
          <p className="site-footer__about">{t('footer.aboutText')}</p>
          <div style={{ marginTop: 14 }}>
            <LanguageSwitcher />
          </div>
          <div className="site-footer__social" aria-label="Social media">
            {socialLinks.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                className="site-footer__social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        <div className="site-footer__col">
          <h3 className="site-footer__heading">{t('footer.quickLink')}</h3>
          <ul className="site-footer__links">
            {quickLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.id === 'home' ? '#/' : `#/${link.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    go(link.id)
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__col">
          <h3 className="site-footer__heading">{t('footer.terms')}</h3>
          <ul className="site-footer__links">
            {policyLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.section ? '#/' : `#/${link.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    if (link.section) goSection(link.section)
                    else go(link.id)
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer__col site-footer__col--contact">
          <h3 className="site-footer__heading">{t('nav.contact')}</h3>
          <ul className="site-footer__contact">
            {contactItems.map(({ icon: Icon, label, href, external }) => (
              <li key={label}>
                <a
                  href={href}
                  className="site-footer__contact-item"
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  onClick={(e) => {
                    if (href.startsWith('#/')) {
                      e.preventDefault()
                      go(href.replace('#/', '') || 'home')
                    }
                  }}
                >
                  <span className="site-footer__contact-icon" aria-hidden="true">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <span>{label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="container site-footer__bottom-inner">
          <p>
            © {year} {t('common.brand')}. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}
