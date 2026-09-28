import { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import StatsBar from '../components/StatsBar'
import HowItWorks from '../components/HowItWorks'
import Communities from '../components/Communities'
import ServicesSection from '../components/ServicesSection'
import WhyChooseUs from '../components/WhyChooseUs'
import SafetyVerification from '../components/SafetyVerification'
import SuccessStories from '../components/SuccessStories'
import FaqSection from '../components/FaqSection'
import CTASection from '../components/CTASection'
import DownloadApp from '../components/DownloadApp'
import TrustFeatures from '../components/TrustFeatures'
import EnquiryPopup from '../components/EnquiryPopup'

export default function Home({ onNavigate }) {
  const [enquiryOpen, setEnquiryOpen] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setEnquiryOpen(true), 800)
    return () => window.clearTimeout(timer)
  }, [])

  const closeEnquiry = () => setEnquiryOpen(false)

  return (
    <>
      <Hero onNavigate={onNavigate} />
      <StatsBar />
      <HowItWorks />
      <Communities />
      <ServicesSection onNavigate={onNavigate} />
      <WhyChooseUs />
      <SafetyVerification onNavigate={onNavigate} />
      <SuccessStories onNavigate={onNavigate} />
      <FaqSection />
      <CTASection onNavigate={onNavigate} />
      <DownloadApp />
      <TrustFeatures />
      <EnquiryPopup open={enquiryOpen} onClose={closeEnquiry} />
    </>
  )
}
