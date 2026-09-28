import { useEffect, useState } from 'react'
import { Users, Heart, ShieldCheck, Star } from 'lucide-react'
import { api } from '../api'
import './StatsBar.css'

export default function StatsBar() {
  const [stats, setStats] = useState([
    { icon: Users, value: '—', label: 'Active Members' },
    { icon: Heart, value: '—', label: 'Paid Members' },
    { icon: ShieldCheck, value: '100%', label: 'Verified Profiles' },
    { icon: Star, value: '4.8/5', label: 'User Satisfaction' },
  ])

  useEffect(() => {
    api('/api/public/stats')
      .then((d) => {
        const s = d.stats || {}
        setStats([
          { icon: Users, value: String(s.members || 0), label: 'Active Members' },
          { icon: Heart, value: String(s.paid || 0), label: 'Paid Members' },
          { icon: ShieldCheck, value: String(s.brides || 0), label: 'Brides' },
          { icon: Star, value: String(s.grooms || 0), label: 'Grooms' },
        ])
      })
      .catch(() => {})
  }, [])

  return (
    <section className="stats" aria-label="Platform statistics">
      <div className="container">
        <div className="stats__bar">
          {stats.map(({ icon: Icon, value, label }) => (
            <div className="stats__item" key={label}>
              <Icon className="stats__icon" size={26} strokeWidth={1.75} />
              <div>
                <p className="stats__value">{value}</p>
                <p className="stats__label">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
