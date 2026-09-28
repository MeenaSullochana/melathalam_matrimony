import { useEffect, useState } from 'react'
import { Heart } from 'lucide-react'
import PageShell from '../components/PageShell'
import arunPriya from '../assets/success-stories/arun-priya.jpg'
import { api, API_BASE } from '../api'
import { useT } from '../i18n/LanguageContext'
import './StoriesPage.css'

const fallback = [
  {
    image: arunPriya,
    quote: 'We found each other through Melathalam Matrimony. Thank you for being a part of our journey!',
    he: 'Arun',
    she: 'Priya',
    city: 'Chennai',
  },
]

export default function StoriesPage() {
  const t = useT()
  const [stories, setStories] = useState(fallback)

  useEffect(() => {
    api('/api/public/success-stories')
      .then((d) => {
        const mapped = (d.stories || []).map((s) => ({
          image: s.weddingphoto
            ? `${API_BASE}/SuccessStory/${s.weddingphoto}`
            : arunPriya,
          quote: s.successmessage || 'Happily married through our matrimony service.',
          he: s.groomname,
          she: s.bridename,
          city: s.address || s.country || '',
        }))
        if (mapped.length) setStories(mapped)
      })
      .catch(() => {})
  }, [])

  return (
    <PageShell
      eyebrow={t('storiesPage.eyebrow')}
      title={t('storiesPage.title')}
      subtitle={t('storiesPage.subtitle')}
    >
      <div className="page-grid page-grid--3 stories-page__grid">
        {stories.map((story) => (
          <article className="page-card stories-page__card" key={`${story.he}-${story.she}-${story.city}`}>
            <img
              className="stories-page__photo"
              src={story.image}
              alt={`${story.he} and ${story.she}`}
            />
            <div className="stories-page__body">
              <p className="stories-page__quote">&ldquo;{story.quote}&rdquo;</p>
              <p className="stories-page__names">
                {story.he} <Heart size={13} fill="currentColor" strokeWidth={0} /> {story.she}
              </p>
              <p className="stories-page__city">{story.city}</p>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  )
}
