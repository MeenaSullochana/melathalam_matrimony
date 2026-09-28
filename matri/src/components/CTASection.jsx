import { useMemo } from 'react'
import { PenLine, ShieldCheck, Heart } from 'lucide-react'
import hands from '../assets/cta/hands.jpg'
import { useT } from '../i18n/LanguageContext'
import './CTASection.css'

export default function CTASection({ onNavigate }) {
  const t = useT()
  const points = useMemo(
    () => [
      { icon: PenLine, label: t('cta.p1') },
      { icon: ShieldCheck, label: t('cta.p2') },
      { icon: Heart, label: t('cta.p3') },
    ],
    [t],
  )

  return (
    <section className="cta" id="membership-cta">
      <div className="container">
        <div className="cta__banner">
          <div className="cta__image">
            <img src={hands} alt={t('cta.imageAlt')} />
          </div>

          <div className="cta__content">
            <div className="cta__copy">
              <h2 className="cta__title">{t('cta.title')}</h2>
              <p className="cta__text">{t('cta.text')}</p>
              <div className="cta__actions">
                <button type="button" className="cta__btn" onClick={() => onNavigate?.('register')}>
                  {t('cta.create')}
                </button>
                <button
                  type="button"
                  className="btn btn-outline cta__membership-btn"
                  onClick={() => onNavigate?.('membership')}
                >
                  {t('cta.membership')}
                </button>
              </div>
            </div>

            <ul className="cta__points">
              {points.map(({ icon: Icon, label }) => (
                <li key={label}>
                  <span className="cta__point-icon">
                    <Icon size={16} strokeWidth={1.8} />
                  </span>
                  <span>{label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="cta__watermark" aria-hidden="true">
            <svg viewBox="0 0 120 110" fill="none">
              <path
                d="M60 100C58 98.5 20 78 10 55 2 38 8 18 26 14c10-2.5 20 2 26 12l8 12 8-12c6-10 16-14.5 26-12 18 4 24 24 16 41-10 23-48 43.5-50 45z"
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
