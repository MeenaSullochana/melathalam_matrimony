import PageShell from '../components/PageShell'
import { ServicesGrid } from '../components/ServicesSection'
import { useT } from '../i18n/LanguageContext'
import '../components/ServicesSection.css'

export default function ServicesPage() {
  const t = useT()
  return (
    <PageShell eyebrow={t('servicesPage.eyebrow')} title={t('servicesPage.title')} subtitle={t('servicesPage.subtitle')}>
      <div className="services-page">
        <ServicesGrid titleTag="h2" />
      </div>
    </PageShell>
  )
}
