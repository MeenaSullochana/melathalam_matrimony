import hindu from '../assets/communities/hindu.jpg'
import muslim from '../assets/communities/muslim.jpg'
import christian from '../assets/communities/christian.jpg'
import sikh from '../assets/communities/sikh.jpg'
import jain from '../assets/communities/jain.jpg'
import other from '../assets/communities/other.jpg'
import './Communities.css'

const communities = [
  { name: 'Hindu', image: hindu },
  { name: 'Muslim', image: muslim },
  { name: 'Christian', image: christian },
  { name: 'Sikh', image: sikh },
  { name: 'Jain', image: jain },
  { name: 'Other Communities', image: other },
]

function FloralOrnament() {
  return (
    <div className="floral-divider" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <path d="M7 0c.4 2.4 1.6 4.2 3.5 5.2C8.6 5.6 7.4 7.2 7 10 6.6 7.2 5.4 5.6 3.5 5.2 5.4 4.2 6.6 2.4 7 0z" />
        <circle cx="7" cy="7" r="1.2" />
      </svg>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
        <path d="M9 1c.5 3 2 5.2 4.4 6.4C11 8 9.5 10 9 13.5 8.5 10 7 8 4.6 7.4 9 6.2 8.5 4 9 1z" />
        <path d="M9 5.5c1.2 0 2.2 1 2.2 2.2S10.2 9.9 9 9.9 6.8 8.9 6.8 7.7 7.8 5.5 9 5.5z" opacity=".35" />
      </svg>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
        <path d="M7 0c.4 2.4 1.6 4.2 3.5 5.2C8.6 5.6 7.4 7.2 7 10 6.6 7.2 5.4 5.6 3.5 5.2 5.4 4.2 6.6 2.4 7 0z" />
        <circle cx="7" cy="7" r="1.2" />
      </svg>
    </div>
  )
}

export default function Communities() {
  return (
    <section className="communities" id="about">
      <div className="container">
        <h2 className="section-title communities__title">Find Matches by Community</h2>
        <FloralOrnament />

        <div className="communities__track">
          {communities.map(({ name, image }) => (
            <article className="community-card" key={name}>
              <div className="community-card__image">
                <img src={image} alt={`${name} community`} />
              </div>
              <p className="community-card__name">{name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
