import { Gem, Headset, Shield, Users } from 'lucide-react'
import './TrustFeatures.css'

const features = [
  {
    icon: Gem,
    title: 'Premium Membership',
    text: 'Get better visibility',
  },
  {
    icon: Headset,
    title: 'Dedicated Support',
    text: 'We are here to help',
  },
  {
    icon: Shield,
    title: 'Privacy Assured',
    text: 'Your data is safe with us',
  },
  {
    icon: Users,
    title: 'Genuine Profiles',
    text: 'Real people, real intentions',
  },
]

export default function TrustFeatures() {
  return (
    <section className="trust" aria-label="Trust features">
      <div className="container">
        <div className="trust__bar">
          {features.map(({ icon: Icon, title, text }) => (
            <div className="trust__item" key={title}>
              <span className="trust__icon">
                <Icon size={22} strokeWidth={1.6} />
              </span>
              <div>
                <p className="trust__title">{title}</p>
                <p className="trust__text">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
