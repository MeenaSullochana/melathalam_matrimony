import { useEffect, useState } from 'react'
import { CalendarDays, Eye, Phone, Sparkles, Check } from 'lucide-react'
import PageShell from '../components/PageShell'
import { api } from '../api'
import { useAuth } from '../auth'
import { useT } from '../i18n/LanguageContext'
import './Membership.css'

export default function Membership({ onNavigate }) {
  const t = useT()
  const { isLoggedIn } = useAuth()
  const [packages, setPackages] = useState([])

  useEffect(() => {
    api('/api/public/plans')
      .then((d) => {
        setPackages(
          (d.plans || []).map((p, i) => ({
            id: p.plan_id || p._id || i,
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

  const onPay = () => {
    onNavigate?.(isLoggedIn ? 'upgrade' : 'login')
  }

  return (
    <PageShell
      eyebrow={t('membershipPage.eyebrow')}
      title={t('membershipPage.title')}
      subtitle={t('membershipPage.subtitle')}
    >
      <div className="page-grid page-grid--4 membership__grid">
        {!packages.length ? (
          <p className="page-card" style={{ gridColumn: '1 / -1', padding: 24, textAlign: 'center' }}>
            No membership packages available right now. Please check back soon.
          </p>
        ) : null}
        {packages.map((pkg, index) => (
          <article
            key={pkg.id || pkg.name}
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

            <button
              type="button"
              className={`btn membership-card__pay ${index === 3 ? 'membership-card__pay--primary' : 'btn-outline'}`}
              onClick={onPay}
            >
              Pay
            </button>
          </article>
        ))}
      </div>
    </PageShell>
  )
}
