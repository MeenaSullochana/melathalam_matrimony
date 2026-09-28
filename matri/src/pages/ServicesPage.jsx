import PageShell from '../components/PageShell'
import { ServicesGrid } from '../components/ServicesSection'
import { useT } from '../i18n/LanguageContext'
import { useEffect, useState } from 'react'
import { api, API_BASE, siteAssetUrl } from '../api'
import { services as fallbackServices } from '../data/services'
import '../components/ServicesSection.css'

export default function ServicesPage() {
  const t = useT()
  const [items, setItems] = useState(null)

  useEffect(() => {
    api('/api/public/services')
      .then((d) => {
        const mapped = (d.services || []).map((s, index) => ({
          title: s.title || 'Service',
          text: s.text || '',
          image: s.image
            ? siteAssetUrl(s.image) || `${API_BASE}/img/${String(s.image).replace(/^\//, '')}`
            : fallbackServices[index % fallbackServices.length]?.image,
          key: s.service_id || s.title || index,
        }))
        if (mapped.length) setItems(mapped)
      })
      .catch(() => {})
  }, [])

  return (
    <PageShell eyebrow={t('servicesPage.eyebrow')} title={t('servicesPage.title')} subtitle={t('servicesPage.subtitle')}>
      <div className="services-page">
        <ServicesGrid titleTag="h2" items={items} />
      </div>
    </PageShell>
  )
}
