import PageShell from '../components/PageShell'
import './PolicyPage.css'

const pages = {
  terms: {
    eyebrow: 'Legal',
    title: 'Terms & Condition',
    subtitle: 'Please read these terms carefully before using Melathalam Matrimony.',
    body: [
      'By creating an account or using Melathalam Matrimony, you agree to use the platform honestly, respectfully, and only for genuine matrimonial purposes.',
      'You are responsible for the accuracy of the information you share on your profile. Misrepresentation, impersonation, or misuse of another person\'s details is not allowed.',
      'Melathalam Matrimony may suspend or remove accounts that violate these terms, community guidelines, or applicable law.',
    ],
  },
  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    subtitle: 'How we collect, use, and protect your personal information.',
    body: [
      'We collect profile details, contact information, and usage data needed to help you find suitable matches and operate our services.',
      'Your information is shared with other members only according to your privacy settings and membership entitlements.',
      'We take reasonable measures to protect your data and do not sell personal information to third parties for marketing.',
    ],
  },
  'report-misuse': {
    eyebrow: 'Safety',
    title: 'Report Misuse',
    subtitle: 'Help us keep Melathalam Matrimony safe for every family.',
    body: [
      'If you notice fake profiles, harassment, fraud attempts, or any misuse, please report it immediately.',
      'Email us at support@kalyanamatrimonial.com with the profile ID, screenshots if available, and a short description of the issue.',
      'Our support team reviews reports carefully and may take action including warnings, profile removal, or account suspension.',
    ],
  },
  refund: {
    eyebrow: 'Legal',
    title: 'Refund Policy',
    subtitle: 'Clear guidelines on membership payments and refunds.',
    body: [
      'Membership fees are generally non-refundable once a paid plan has been activated and services have begun.',
      'If a technical issue on our side prevents access to paid features, contact support within 7 days for review.',
      'Approved refunds, if any, are processed to the original payment method within a reasonable business timeline.',
    ],
  },
  faq: {
    eyebrow: 'Help',
    title: 'FAQ',
    subtitle: 'Answers to common questions about Melathalam Matrimony.',
    body: [
      'Is registration free? Yes. Creating a basic profile is free. Premium membership unlocks additional contact views and visibility.',
      'Are profiles verified? We encourage document verification and review reported profiles to improve trust and safety.',
      'How do I contact support? Call or WhatsApp +91 97909 05844, or email info@kalyanamatrimonial.com / support@kalyanamatrimonial.com.',
    ],
  },
}

export default function PolicyPage({ pageId }) {
  const page = pages[pageId] || pages.faq

  return (
    <PageShell eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle} narrow>
      <div className="page-card page-card--static policy-page">
        {page.body.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
    </PageShell>
  )
}
