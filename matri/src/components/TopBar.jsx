import { useMemo } from 'react'
import { useT } from '../i18n/LanguageContext'
import './TopBar.css'

export default function TopBar({ onNavigate }) {
  const t = useT()
  const aboutMessages = useMemo(
    () => [t('topbar.m1'), t('topbar.m2'), t('topbar.m3'), t('topbar.m4'), t('topbar.m5'), t('topbar.m6')],
    [t],
  )
  const items = [...aboutMessages, ...aboutMessages]

  return (
    <div className="top-bar" role="region" aria-label={t('topbar.region')}>
      <div className="top-bar__track">
        <div className="top-bar__marquee">
          {items.map((text, i) => (
            <button
              key={`${text}-${i}`}
              type="button"
              className="top-bar__item"
              onClick={() => onNavigate?.('about')}
            >
              <span className="top-bar__dot" aria-hidden="true" />
              <span>{text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
