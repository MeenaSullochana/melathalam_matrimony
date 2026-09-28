import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import arunPriya from '../assets/success-stories/arun-priya.jpg'
import karthikDivya from '../assets/success-stories/karthik-divya.jpg'
import rahulSneha from '../assets/success-stories/rahul-sneha.jpg'
import { api, API_BASE } from '../api'
import './SuccessStories.css'

const fallbackStories = [
  {
    image: arunPriya,
    quote: 'We found each other through Melathalam Matrimony. Thank you for being a part of our journey!',
    he: 'Arun',
    she: 'Priya',
    city: 'Chennai',
  },
  {
    image: karthikDivya,
    quote: 'A trusted platform with genuine profiles. We are happily married now!',
    he: 'Karthik',
    she: 'Divya',
    city: 'Coimbatore',
  },
  {
    image: rahulSneha,
    quote: 'Our families connected and so did we. Forever grateful!',
    he: 'Rahul',
    she: 'Sneha',
    city: 'Bangalore',
  },
]

function StoryCard({ story }) {
  return (
    <article className="story-card">
      <img
        className="story-card__photo"
        src={story.image}
        alt={`${story.he} and ${story.she}`}
      />
      <div className="story-card__body">
        <p className="story-card__quote">&ldquo;{story.quote}&rdquo;</p>
        <p className="story-card__names">
          {story.he} <Heart size={13} fill="currentColor" strokeWidth={0} /> {story.she}
        </p>
        <p className="story-card__city">{story.city}</p>
      </div>
      <span className="story-card__mark" aria-hidden="true">
        &rdquo;
      </span>
    </article>
  )
}

export default function SuccessStories({ onNavigate }) {
  const [stories, setStories] = useState(fallbackStories)

  useEffect(() => {
    api('/api/public/success-stories')
      .then((d) => {
        const mapped = (d.stories || []).map((s, i) => ({
          image: s.weddingphoto
            ? `${API_BASE}/SuccessStory/${String(s.weddingphoto).replace(/^\//, '')}`
            : fallbackStories[i % fallbackStories.length].image,
          quote: s.successmessage || 'Happily married through our matrimony service.',
          he: s.groomname || 'Groom',
          she: s.bridename || 'Bride',
          city: s.address || s.country || '',
        }))
        if (mapped.length) setStories(mapped)
      })
      .catch(() => {})
  }, [])

  const loop = stories.length === 1 ? [...stories, ...stories, ...stories] : [...stories, ...stories]

  return (
    <section className="stories" id="stories">
      <div className="container">
        <div className="stories__header">
          <h2 className="section-title stories__title">Real People. Real Happiness.</h2>
          <p className="stories__subtitle">
            Thousands of couples have found their special someone with us.
            <br />
            Here are a few of their beautiful stories.
          </p>
        </div>
      </div>

      <div className="stories__track" aria-label="Success story highlights">
        <div className="stories__marquee">
          {loop.map((story, i) => (
            <StoryCard key={`${story.he}-${story.she}-${i}`} story={story} />
          ))}
        </div>
      </div>

      <div className="container">
        <div className="stories__footer">
          <button
            type="button"
            className="btn btn-outline stories__view-all"
            onClick={() => onNavigate?.('stories')}
          >
            View All Success Stories
          </button>
        </div>
      </div>
    </section>
  )
}
