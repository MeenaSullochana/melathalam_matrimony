import { useLanguage } from '../i18n/LanguageContext'
import './LanguageSwitcher.css'

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang, locales, t } = useLanguage()

  return (
    <div className={`lang-switch ${compact ? 'lang-switch--compact' : ''}`} role="group" aria-label={t('nav.language')}>
      {locales.map((locale) => (
        <button
          key={locale.code}
          type="button"
          className={`lang-switch__btn ${lang === locale.code ? 'is-active' : ''}`}
          onClick={() => setLang(locale.code)}
          aria-pressed={lang === locale.code}
          title={locale.label}
        >
          {compact ? locale.short : locale.label}
        </button>
      ))}
    </div>
  )
}
