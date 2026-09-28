import { useEffect, useRef, useState } from 'react'
import {
  ShieldCheck,
  BadgeCheck,
  Fingerprint,
  EyeOff,
  Flag,
  Lock,
} from 'lucide-react'
import './SafetyVerification.css'

const pillars = [
  {
    icon: BadgeCheck,
    title: 'Verified Profiles',
    text: 'Document checks and review help you identify authentic members with real intentions.',
  },
  {
    icon: EyeOff,
    title: 'Privacy Controls',
    text: 'Decide who can view your photos and contact you — your details stay in your hands.',
  },
  {
    icon: Fingerprint,
    title: 'Secure Access',
    text: 'Protective measures keep your account and conversations safer every step of the way.',
  },
  {
    icon: Flag,
    title: 'Report Misuse',
    text: 'Flag suspicious activity anytime. Our team reviews reports and takes swift action.',
  },
]

export default function SafetyVerification({ onNavigate }) {
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

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
      { threshold: 0.15 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className={`safety${visible ? ' safety--visible' : ''}`}
      id="safety"
      ref={sectionRef}
      aria-labelledby="safety-title"
    >
      <div className="container safety__layout">
        <div className="safety__intro">
          <p className="safety__eyebrow">Trusted &amp; Protected</p>
          <h2 className="section-title safety__title" id="safety-title">
            Safety &amp; Verification
          </h2>
          <p className="safety__lead">
            A trusted matrimony space built with privacy, care, and verified profiles — so every
            family connects with confidence.
          </p>

          <div className="safety__badge" aria-hidden="true">
            <span className="safety__badge-ring" />
            <span className="safety__badge-core">
              <ShieldCheck size={36} strokeWidth={1.5} />
            </span>
            <span className="safety__badge-lock">
              <Lock size={14} strokeWidth={2.2} />
            </span>
          </div>

          <div className="safety__actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate?.('privacy')}
            >
              Privacy Policy
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => onNavigate?.('report-misuse')}
            >
              Report Misuse
            </button>
          </div>
        </div>

        <div className="safety__grid">
          {pillars.map(({ icon: Icon, title, text }, index) => (
            <article
              className="safety-card"
              key={title}
              style={{ '--card-i': index }}
            >
              <span className="safety-card__icon">
                <Icon size={22} strokeWidth={1.65} />
              </span>
              <h3 className="safety-card__title">{title}</h3>
              <p className="safety-card__text">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
