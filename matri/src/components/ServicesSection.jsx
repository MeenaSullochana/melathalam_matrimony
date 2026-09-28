import { useEffect, useRef, useState } from 'react'
import { services } from '../data/services'
import './ServicesSection.css'

export function ServicesGrid({ titleTag: TitleTag = 'h3' }) {
  return (
    <div className="services__grid">
      {services.map(({ title, text, image }, index) => (
        <article className="service-card" key={title} style={{ '--card-i': index }}>
          <div className="service-card__image">
            <img src={image} alt={title} loading="lazy" decoding="async" />
          </div>
          <div className="service-card__body">
            <TitleTag className="service-card__title">{title}</TitleTag>
            <p className="service-card__text">{text}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

export default function ServicesSection({ onNavigate }) {
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
      { threshold: 0.12 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className={`services${visible ? ' services--visible' : ''}`}
      id="services"
      ref={sectionRef}
      aria-labelledby="services-title"
    >
      <div className="container">
        <div className="services__header">
          <p className="services__eyebrow">What We Offer</p>
          <h2 className="section-title services__title" id="services-title">
            Our Services
          </h2>
          <p className="services__subtitle">
            Dedicated matchmaking support for every stage of your marriage journey.
          </p>
          <div className="floral-divider services__divider" aria-hidden="true">
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

        <ServicesGrid />

        <div className="services__footer">
          <button
            type="button"
            className="btn btn-outline services__view-all"
            onClick={() => onNavigate?.('services')}
          >
            View Our Services
          </button>
        </div>
      </div>
    </section>
  )
}
