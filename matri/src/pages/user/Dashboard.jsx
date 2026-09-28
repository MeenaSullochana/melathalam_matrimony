import { useEffect, useState } from 'react'
import { Eye, Heart, MessageCircle, Users, ArrowRight, Sparkles } from 'lucide-react'
import { api } from '../../api'
import { useAuth } from '../../auth'
import './user-pages.css'

export default function Dashboard({ onNavigate }) {
  const { token, member } = useAuth()
  const [data, setData] = useState(null)

  useEffect(() => {
    api('/api/member/dashboard', { token })
      .then(setData)
      .catch(() => setData({ stats: {}, activity: [] }))
  }, [token])

  const stats = [
    { label: 'Profile Views', value: data?.stats?.visitors ?? '—', icon: Eye },
    { label: 'Interests', value: data?.stats?.interestsReceived ?? '—', icon: Heart },
    { label: 'Matches', value: data?.stats?.matches ?? '—', icon: Users },
    { label: 'Sent', value: data?.stats?.interestsSent ?? '—', icon: MessageCircle },
  ]

  const activity = (data?.activity || []).slice(0, 6).map((item) => ({
    title: item.ei_sender === member?.matri_id ? 'Interest sent' : 'Interest received',
    detail: item.ei_message || `${item.ei_sender} → ${item.ei_receiver}`,
    time: item.ei_sent_date ? String(item.ei_sent_date).slice(0, 16) : '',
  }))

  return (
    <div className="user-page">
      <section className="dash-hero user-panel">
        <div>
          <p className="dash-hero__eyebrow">
            <Sparkles size={14} strokeWidth={2} />
            Your journey continues
          </p>
          <h2 className="user-panel__title">
            Welcome{member?.firstname ? `, ${member.firstname}` : ''}
          </h2>
          <p className="user-panel__sub">
            Track activity, discover matches, and keep your profile polished for better responses.
          </p>
          <div className="dash-hero__actions">
            <button type="button" className="btn btn-primary" onClick={() => onNavigate('matches')}>
              Find Matches
              <ArrowRight size={16} />
            </button>
            <button type="button" className="btn btn-outline" onClick={() => onNavigate('profile')}>
              Edit Profile
            </button>
          </div>
        </div>
        <div className="dash-hero__badge" aria-hidden="true">
          <span>{data?.stats?.featured || 'Member'}</span>
          <strong>{data?.stats?.status || member?.status || 'Active'}</strong>
          <em>ID {member?.matri_id}</em>
        </div>
      </section>

      <section className="user-stat-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <article key={label} className="user-stat">
            <div className="user-stat__icon">
              <Icon size={18} strokeWidth={1.85} />
            </div>
            <p className="user-stat__value">{value}</p>
            <p className="user-stat__label">{label}</p>
          </article>
        ))}
      </section>

      <div className="dash-split">
        <section className="user-panel">
          <div className="user-panel__head">
            <div>
              <h3 className="user-panel__title" style={{ fontSize: 20 }}>
                Recent activity
              </h3>
              <p className="user-panel__sub">Latest updates on your profile</p>
            </div>
          </div>
          <ul className="dash-activity">
            {(activity.length ? activity : [{ title: 'No activity yet', detail: 'Send interests to start matching', time: '' }]).map((item) => (
              <li key={`${item.title}-${item.time}-${item.detail}`} className="dash-activity__item">
                <span className="dash-activity__dot" />
                <div>
                  <p className="dash-activity__title">{item.title}</p>
                  <p className="dash-activity__detail">{item.detail}</p>
                </div>
                <time>{item.time}</time>
              </li>
            ))}
          </ul>
        </section>
        <section className="user-panel">
          <h3 className="user-panel__title" style={{ fontSize: 20 }}>Quick links</h3>
          <div className="dash-hero__actions" style={{ marginTop: 16, flexDirection: 'column', alignItems: 'stretch' }}>
            <button type="button" className="btn btn-outline" onClick={() => onNavigate('interests')}>View interests</button>
            <button type="button" className="btn btn-outline" onClick={() => onNavigate('upgrade')}>Membership plans</button>
          </div>
        </section>
      </div>
    </div>
  )
}
