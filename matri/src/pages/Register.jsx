import PageShell from '../components/PageShell'
import RegisterForm from '../components/RegisterForm'
import { useT } from '../i18n/LanguageContext'
import './Auth.css'

export default function Register({ onNavigate }) {
  const t = useT()
  return (
    <PageShell
      eyebrow={t('registerPage.eyebrow')}
      title={t('registerPage.title')}
      subtitle={t('registerPage.subtitle')}
      medium
    >
      <RegisterForm onNavigate={onNavigate} />
    </PageShell>
  )
}
