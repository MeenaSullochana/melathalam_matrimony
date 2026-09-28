import { useEffect, useState } from 'react'
import { CalendarDays, Eye, Phone, Sparkles, Check } from 'lucide-react'
import PageShell from '../components/PageShell'
import { api } from '../api'
import './Membership.css'

export default function Membership() {
  const [packages, setPackages] = useState([])

  useEffect(() => {
    api('/api/public/plans')
      .then((d) => {
        setPackages(
          (d.plans || []).map((p, i) => ({
            name: `${p.plan_name} Package`,
            price: Number(p.plan_amount).toLocaleString('en-IN'),
            duration: `${p.plan_duration} Days`,
            contactViews: p.plan_contacts,
            profileViews: p.profile,
            featured: i === 1,
            badge: i === 1 ? 'Popular' : i === 3 ? 'Best Value' : null,
          })),
        )
      })
      .catch(() => setPackages([]))
  }, [])

  return (
    <PageShell
      eyebrow="Membership"
      title="Package Details"
      subtitle="Choose the plan that fits your journey. Every package includes verified matches and secure contact access."
    >
      <div className="page-grid page-grid--4 membership__grid">
        {!packages.length ? (
          <p className="page-card" style={{ gridColumn: '1 / -1', padding: 24, textAlign: 'center' }}>
            No membership packages available right now. Please check back soon.
          </p>
        ) : null}
        {packages.map((pkg) => (
          <article
            key={pkg.name}
            className={`page-card membership-card ${pkg.featured ? 'membership-card--featured' : ''}`}
          >
            {pkg.badge && <span className="membership-card__badge">{pkg.badge}</span>}
            <div className="membership-card__top">
              <span className="membership-card__icon" aria-hidden="true">
                <Sparkles size={18} strokeWidth={1.8} />
              </span>
              <h2 className="membership-card__name">{pkg.name}</h2>
              <p className="membership-card__price">
                <span className="membership-card__currency">Rs.</span>
                {pkg.price}
              </p>
            </div>

            <ul className="membership-card__features">
              <li>
                <CalendarDays size={16} strokeWidth={1.8} />
                <span>
                  Duration: <strong>{pkg.duration}</strong>
                </span>
              </li>
              <li>
                <Phone size={16} strokeWidth={1.8} />
                <span>
                  Contact Views: <strong>{pkg.contactViews}</strong>
                </span>
              </li>
              <li>
                <Eye size={16} strokeWidth={1.8} />
                <span>
                  Profile Views: <strong>{pkg.profileViews}</strong>
                </span>
              </li>
              <li>
                <Check size={16} strokeWidth={1.8} />
                <span>Priority support</span>
              </li>
            </ul>
          </article>
        ))}
      </div>
    </PageShell>
  )
}
