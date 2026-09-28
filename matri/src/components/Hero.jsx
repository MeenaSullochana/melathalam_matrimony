import { useMemo } from 'react'
import { ShieldCheck, Users, Heart } from 'lucide-react'
import RegisterForm from './RegisterForm'
import coupleHd from '../assets/hero/couple-wedding.png'
import { useT } from '../i18n/LanguageContext'
import './Hero.css'

export default function Hero({ onNavigate }) {
  const t = useT()
  const trusts = useMemo(
    () => [
      { icon: ShieldCheck, label: t('hero.trust1') },
      { icon: Users, label: t('hero.trust2') },
      { icon: Heart, label: t('hero.trust3') },
    ],
    [t],
  )

  return (
    <section className="hero" id="home">
      <div className="hero__media">
        <img src={coupleHd} alt={t('hero.photoAlt')} className="hero__photo" />
        <div className="hero__fade" />
      </div>

      <div className="hero__inner container">
        <div className="hero__content">
          <h1 className="hero__title">{t('hero.title')}</h1>
          <p className="hero__subtitle">{t('hero.subtitle')}</p>
          <ul className="hero__trust">
            {trusts.map(({ icon: Icon, label }) => (
              <li key={label}>
                <Icon className="hero__trust-icon" size={18} strokeWidth={2.1} />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero__register" id="register-form">
          <RegisterForm onNavigate={onNavigate} className="hero__register-form" />
        </div>
      </div>
    </section>
  )
}
