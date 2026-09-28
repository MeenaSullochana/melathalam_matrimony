import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, HelpCircle, ShieldCheck, HeartHandshake, BadgeCheck } from 'lucide-react'
import { useT } from '../i18n/LanguageContext'
import './FaqSection.css'

export default function FaqSection() {
  const t = useT()
  const sectionRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [openIndex, setOpenIndex] = useState(0)

  const faqs = useMemo(
    () => [
      { q: t('faq.q1'), a: t('faq.a1') },
      { q: t('faq.q2'), a: t('faq.a2') },
      { q: t('faq.q3'), a: t('faq.a3') },
      { q: t('faq.q4'), a: t('faq.a4') },
      { q: t('faq.q5'), a: t('faq.a5') },
    ],
    [t],
  )

  const highlights = useMemo(
    () => [
      { icon: ShieldCheck, label: t('hero.trust2') },
      { icon: BadgeCheck, label: t('hero.trust1') },
      { icon: HeartHandshake, label: t('why.b5Title') },
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
      { threshold: 0.15 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index))
  }

  return (
    <section
      className={`faq${visible ? ' faq--visible' : ''}`}
      id="faq"
      ref={sectionRef}
      aria-labelledby="faq-title"
    >
      <div className="faq__glow" aria-hidden="true" />
      <div className="container faq__layout">
        <aside className="faq__intro">
          <p className="faq__eyebrow">
            <HelpCircle size={14} strokeWidth={2} />
            {t('footer.faq')}
          </p>
          <h2 className="section-title faq__title" id="faq-title">
            {t('faq.title')}
          </h2>
          <p className="faq__subtitle">{t('faq.subtitle')}</p>

          <div className="faq__highlights" aria-label={t('why.eyebrow')}>
            {highlights.map(({ icon: Icon, label }) => (
              <div className="faq__chip" key={label}>
                <span className="faq__chip-icon" aria-hidden="true">
                  <Icon size={16} strokeWidth={2} />
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </aside>

        <div className="faq__list">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div className={`faq-item${isOpen ? ' is-open' : ''}`} key={item.q} style={{ '--i': index }}>
                <button
                  type="button"
                  className="faq-item__trigger"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  id={`faq-trigger-${index}`}
                  onClick={() => toggle(index)}
                >
                  <span className="faq-item__index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="faq-item__question">{item.q}</span>
                  <span className="faq-item__icon" aria-hidden="true">
                    <ChevronDown size={18} strokeWidth={2.2} />
                  </span>
                </button>
                <div
                  className="faq-item__panel"
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${index}`}
                  hidden={!isOpen}
                >
                  <p className="faq-item__answer">{item.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
