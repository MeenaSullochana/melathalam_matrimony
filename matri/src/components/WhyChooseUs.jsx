import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ShieldCheck,
  BadgeCheck,
  Sparkles,
  MessageSquareLock,
  UsersRound,
} from 'lucide-react'
import { useT } from '../i18n/LanguageContext'
import './WhyChooseUs.css'

export default function WhyChooseUs() {
  const t = useT()
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  const benefits = useMemo(
    () => [
      { icon: ShieldCheck, title: t('why.b1Title'), text: t('why.b1Text') },
      { icon: BadgeCheck, title: t('why.b2Title'), text: t('why.b2Text') },
      { icon: Sparkles, title: t('why.b3Title'), text: t('why.b3Text') },
      { icon: MessageSquareLock, title: t('why.b4Title'), text: t('why.b4Text') },
      { icon: UsersRound, title: t('why.b5Title'), text: t('why.b5Text') },
    ],
    [t],
  )

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
      className={`why${visible ? ' why--visible' : ''}`}
      id="why-choose-us"
      ref={sectionRef}
      aria-labelledby="why-title"
    >
      <div className="container">
        <div className="why__header">
          <p className="why__eyebrow">{t('why.eyebrow')}</p>
          <h2 className="section-title why__title" id="why-title">
            {t('why.title')}
          </h2>
          <p className="why__subtitle">{t('why.subtitle')}</p>
          <div className="floral-divider why__divider" aria-hidden="true">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <path
                d="M9 13C8.7 12.7 3 9.5 1.5 6.2.6 4.2 1.4 1.6 3.8 1.1c1.4-.3 2.8.3 3.6 1.6L9 5.2l1.6-2.5c.8-1.3 2.2-1.9 3.6-1.6 2.4.5 3.2 3.1 2.3 5.1C14.9 9.5 9.3 12.7 9 13z"
                stroke="currentColor"
                strokeWidth="1.4"
                fill="none"
              />
            </svg>
          </div>
        </div>

        <div className="why__grid">
          {benefits.map(({ icon: Icon, title, text }, index) => (
            <article className="why-card" key={title} style={{ '--card-i': index }}>
              <span className="why-card__icon">
                <Icon size={22} strokeWidth={1.7} />
              </span>
              <h3 className="why-card__title">{title}</h3>
              <p className="why-card__text">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
