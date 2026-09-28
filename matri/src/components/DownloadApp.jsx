import { useEffect, useRef, useState } from 'react'
import { Smartphone, Bell, Heart, Search } from 'lucide-react'
import googlePlayBadge from '../assets/download/google-play.png'
import brandLogo from '../assets/logo/logo.png'
import { loadSiteDefaults, resolveSiteLogo } from '../api'
import './DownloadApp.css'

const highlights = [
  { icon: Search, label: 'Browse matches anytime' },
  { icon: Bell, label: 'Instant interest alerts' },
  { icon: Heart, label: 'Chat securely on the go' },
]

export default function DownloadApp() {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [logoSrc, setLogoSrc] = useState(brandLogo)

  useEffect(() => {
    let cancelled = false
    loadSiteDefaults().then((config) => {
      if (!cancelled) setLogoSrc(resolveSiteLogo(config, brandLogo))
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className={`download${visible ? ' download--visible' : ''}`}
      id="download-app"
      ref={sectionRef}
      aria-labelledby="download-title"
    >
      <div className="container">
        <div className="download__banner">
          <div className="download__glow" aria-hidden="true" />
          <div className="download__pattern" aria-hidden="true" />

          <div className="download__copy">
            <p className="download__eyebrow">
              <Smartphone size={14} strokeWidth={2} />
              Melathalam Matrimony on Mobile
            </p>
            <h2 className="download__title" id="download-title">
              Download the App
            </h2>
            <p className="download__text">
              Carry your matrimony journey with you. Browse verified matches, send interests, and
              stay connected — privately and securely from your phone.
            </p>

            <ul className="download__points">
              {highlights.map(({ icon: Icon, label }, index) => (
                <li key={label} style={{ '--i': index }}>
                  <span className="download__point-icon">
                    <Icon size={15} strokeWidth={1.8} />
                  </span>
                  {label}
                </li>
              ))}
            </ul>

            <div className="download__stores">
              <a
                href="https://play.google.com"
                className="download__store"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={googlePlayBadge}
                  alt="Get it on Google Play"
                  className="download__badge"
                  width={148}
                  height={44}
                />
              </a>
            </div>
          </div>

          <div className="download__phone" aria-hidden="true">
            <div className="download__phone-frame">
              <div className="download__phone-notch" />
              <div className="download__phone-screen">
                <div className="download__phone-brand">
                  <img src={logoSrc} alt="Melathalam Matrimony" />
                </div>
                <div className="download__phone-card">
                  <span className="download__phone-avatar" />
                  <div>
                    <strong>Priya · 28</strong>
                    <em>Chennai · Verified</em>
                  </div>
                </div>
                <div className="download__phone-card download__phone-card--alt">
                  <span className="download__phone-avatar download__phone-avatar--2" />
                  <div>
                    <strong>Arjun · 31</strong>
                    <em>Coimbatore · Verified</em>
                  </div>
                </div>
                <div className="download__phone-cta">View Match</div>
              </div>
            </div>
            <div className="download__phone-shadow" />
          </div>
        </div>
      </div>
    </section>
  )
}
