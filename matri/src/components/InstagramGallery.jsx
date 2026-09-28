import { useEffect, useMemo, useState } from 'react'
import g1 from '../assets/instagram-gallery/gallery-01.png'
import g2 from '../assets/instagram-gallery/gallery-02.png'
import g3 from '../assets/instagram-gallery/gallery-03.png'
import g4 from '../assets/instagram-gallery/gallery-04.png'
import { loadSiteDefaults, siteAssetUrl } from '../api'
import { useAuth } from '../auth'
import './InstagramGallery.css'

const FALLBACKS = [
  { src: g1, alt: 'Gallery image 1' },
  { src: g2, alt: 'Gallery image 2' },
  { src: g3, alt: 'Gallery image 3' },
]

function InstagramGlyph() {
  return (
    <svg className="ig-gallery__glyph" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" />
    </svg>
  )
}

export default function InstagramGallery({ onNavigate }) {
  const { isLoggedIn } = useAuth()
  const [config, setConfig] = useState(null)

  useEffect(() => {
    let cancelled = false
    loadSiteDefaults().then((cfg) => {
      if (!cancelled) setConfig(cfg || {})
    })
    return () => {
      cancelled = true
    }
  }, [])

  const photos = useMemo(() => {
    const keys = ['gallery_image_1', 'gallery_image_2', 'gallery_image_3']
    return keys.map((key, i) => {
      const remote = siteAssetUrl(config?.[key])
      return {
        src: remote || FALLBACKS[i].src,
        alt: FALLBACKS[i].alt,
        fallback: FALLBACKS[i].src,
      }
    })
  }, [config])

  const payImage = siteAssetUrl(config?.gallery_pay_image) || g4

  const onPayClick = (e) => {
    e.preventDefault()
    onNavigate?.(isLoggedIn ? 'upgrade' : 'login')
  }

  const strip = [...photos, { pay: true }, ...photos, { pay: true }]

  return (
    <section className="ig-gallery" aria-label="Melathalam Matrimony on Instagram">
      <div className="ig-gallery__header">
        <a
          href="https://instagram.com"
          className="ig-gallery__follow"
          target="_blank"
          rel="noopener noreferrer"
        >
          <InstagramGlyph />
          <span>
            Follow <strong>@Melathalam Matrimony</strong>
          </span>
        </a>
      </div>

      <div className="ig-gallery__viewport">
        <div className="ig-gallery__track">
          {strip.map((item, index) => {
            if (item.pay) {
              return (
                <button
                  key={`pay-${index}`}
                  type="button"
                  className="ig-gallery__item ig-gallery__item--pay"
                  onClick={onPayClick}
                  aria-label={isLoggedIn ? 'Go to payment' : 'Login to pay'}
                  tabIndex={index >= 4 ? -1 : undefined}
                >
                  <img
                    src={payImage}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width={220}
                    height={220}
                    onError={(e) => {
                      e.currentTarget.src = g4
                    }}
                  />
                  <span className="ig-gallery__pay-badge">Pay</span>
                  <span className="ig-gallery__overlay" aria-hidden="true">
                    <InstagramGlyph />
                  </span>
                </button>
              )
            }

            return (
              <a
                key={`${item.alt}-${index}`}
                href="https://instagram.com"
                className="ig-gallery__item"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.alt}
                tabIndex={index >= 4 ? -1 : undefined}
              >
                <img
                  src={item.src}
                  alt={index >= 4 ? '' : item.alt}
                  loading="lazy"
                  decoding="async"
                  width={220}
                  height={220}
                  onError={(e) => {
                    if (item.fallback && e.currentTarget.src !== item.fallback) {
                      e.currentTarget.src = item.fallback
                    }
                  }}
                />
                <span className="ig-gallery__overlay" aria-hidden="true">
                  <InstagramGlyph />
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
