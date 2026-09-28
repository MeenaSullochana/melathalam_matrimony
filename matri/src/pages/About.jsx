import { HeartHandshake, ShieldCheck, Users, Sparkles } from 'lucide-react'
import PageShell from '../components/PageShell'
import { useT } from '../i18n/LanguageContext'
import './About.css'

const values = [
  {
    icon: HeartHandshake,
    title: 'Meaningful Matches',
    text: 'We focus on compatibility, values, and family alignment — not endless swipes.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust & Privacy',
    text: 'Your data stays protected. Profiles are reviewed so you meet real people with real intent.',
  },
  {
    icon: Users,
    title: 'Community First',
    text: 'From diverse communities across Tamil Nadu and beyond, we bring hearts together with care.',
  },
  {
    icon: Sparkles,
    title: 'Guided Journey',
    text: 'Dedicated support and clear membership options help you move from search to forever.',
  },
]

export default function About() {
  const t = useT()
  return (
    <PageShell
      eyebrow={t('aboutPage.eyebrow')}
      title={t('aboutPage.title')}
      subtitle={t('aboutPage.subtitle')}
    >
      <article className="page-card page-card--static about__intro">
        <p>{t('aboutPage.body')}</p>
      </article>

      <div className="page-grid page-grid--2 about__grid">
        {values.map(({ icon: Icon, title, text }) => (
          <article className="page-card about__card" key={title}>
            <span className="about__icon" aria-hidden="true">
              <Icon size={22} strokeWidth={1.7} />
            </span>
            <h2 className="about__card-title">{title}</h2>
            <p className="about__card-text">{text}</p>
          </article>
        ))}
      </div>
    </PageShell>
  )
}
