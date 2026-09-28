import g1 from '../assets/instagram-gallery/gallery-01.png'
import g2 from '../assets/instagram-gallery/gallery-02.png'
import g3 from '../assets/instagram-gallery/gallery-03.png'
import g4 from '../assets/instagram-gallery/gallery-04.png'
import g5 from '../assets/instagram-gallery/gallery-05.png'
import g6 from '../assets/instagram-gallery/gallery-06.png'
import g7 from '../assets/instagram-gallery/gallery-07.png'
import './InstagramGallery.css'

const photos = [
  { src: g1, alt: 'Traditional Indian wedding couple' },
  { src: g2, alt: 'Happy newlywed couple outdoors' },
  { src: g3, alt: 'South Indian wedding garland ceremony' },
  { src: g4, alt: 'Wedding rings and mehndi hands' },
  { src: g5, alt: 'Elegant wedding couple portrait' },
  { src: g6, alt: 'Christian wedding aisle moment' },
  { src: g7, alt: 'Family celebrating a wedding blessing' },
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

export default function InstagramGallery() {
  const strip = [...photos, ...photos]

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
          {strip.map((photo, index) => (
            <a
              key={`${photo.alt}-${index}`}
              href="https://instagram.com"
              className="ig-gallery__item"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={photo.alt}
              tabIndex={index >= photos.length ? -1 : undefined}
            >
              <img
                src={photo.src}
                alt={index >= photos.length ? '' : photo.alt}
                loading="lazy"
                decoding="async"
                width={220}
                height={220}
              />
              <span className="ig-gallery__overlay" aria-hidden="true">
                <InstagramGlyph />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
