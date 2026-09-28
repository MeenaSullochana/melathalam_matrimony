import { useEffect, useMemo, useRef, useState } from 'react'
import {
  UserRoundPen,
  Compass,
  MessageCircleHeart,
  HeartHandshake,
} from 'lucide-react'
import { useT } from '../i18n/LanguageContext'
import './HowItWorks.css'

export default function HowItWorks() {
  const t = useT()
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)

  const steps = useMemo(
    () => [
      { num: '01', icon: UserRoundPen, title: t('how.s1Title'), text: t('how.s1Text') },
      { num: '02', icon: Compass, title: t('how.s2Title'), text: t('how.s2Text') },
      { num: '03', icon: MessageCircleHeart, title: t('how.s3Title'), text: t('how.s3Text') },
      { num: '04', icon: HeartHandshake, title: t('how.s4Title'), text: t('how.s4Text') },
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
      className={`how${visible ? ' how--visible' : ''}`}
      id="how-it-works"
      ref={sectionRef}
      aria-labelledby="how-title"
    >
      <div className="container">
        <div className="how__header">
          <p className="how__eyebrow">{t('how.eyebrow')}</p>
          <h2 className="section-title how__title" id="how-title">
            {t('how.title')}
          </h2>
          <p className="how__subtitle">{t('how.subtitle')}</p>
          <div className="floral-divider how__divider" aria-hidden="true">
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

        <ol className="how__steps">
          <span className="how__track" aria-hidden="true" />
          {steps.map(({ num, icon: Icon, title, text }, index) => (
            <li className="how__step" key={num} style={{ '--step-i': index }}>
              <div className="how__icon-wrap">
                <span className="how__icon-ring" aria-hidden="true" />
                <span className="how__icon">
                  <Icon size={26} strokeWidth={1.6} />
                </span>
                <span className="how__num">{num}</span>
              </div>
              <h3 className="how__step-title">{title}</h3>
              <p className="how__step-text">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
