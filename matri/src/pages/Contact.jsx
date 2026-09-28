import { useRef, useState } from 'react'
import { Mail, MapPin, Phone, Send, MessageCircle } from 'lucide-react'
import PageShell from '../components/PageShell'
import { api } from '../api'
import './Contact.css'

const details = [
  {
    icon: Phone,
    label: 'Call Us',
    value: '+91 97909 05844',
    href: 'tel:+919790905844',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+91 97909 05844',
    href: 'https://wa.me/919790905844',
    external: true,
  },
  {
    icon: Mail,
    label: 'Info',
    value: 'info@kalyanamatrimonial.com',
    href: 'mailto:info@kalyanamatrimonial.com',
  },
  {
    icon: Mail,
    label: 'Support',
    value: 'support@kalyanamatrimonial.com',
    href: 'mailto:support@kalyanamatrimonial.com',
  },
  {
    icon: MapPin,
    label: 'Visit',
    value: 'No: 37, 2nd Avenue, Anna Nagar, Chennai - 600 040',
    href: null,
  },
]

export default function Contact() {
  const formRef = useRef(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  return (
    <PageShell
      eyebrow="Contact"
      title="We Are Here to Help"
      subtitle="Reach out for membership guidance, profile support, or any questions about your journey."
    >
      <div className="page-grid page-grid--3 contact__details">
        {details.map(({ icon: Icon, label, value, href, external }) => {
          const Inner = (
            <>
              <span className="contact__icon" aria-hidden="true">
                <Icon size={20} strokeWidth={1.8} />
              </span>
              <p className="contact__label">{label}</p>
              <p className="contact__value">{value}</p>
            </>
          )
          return href ? (
            <a
              key={label}
              href={href}
              className="page-card contact__detail"
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {Inner}
            </a>
          ) : (
            <div key={label} className="page-card contact__detail">
              {Inner}
            </div>
          )
        })}
      </div>

      <form
        ref={formRef}
        className="page-card page-card--static contact__form"
        onSubmit={async (e) => {
          e.preventDefault()
          setStatus('')
          setError('')
          setBusy(true)
          const form = formRef.current
          const fd = new FormData(form)
          try {
            await api('/api/public/contact', {
              method: 'POST',
              body: {
                name: fd.get('name'),
                phone: fd.get('phone'),
                message: fd.get('message'),
              },
            })
            setStatus('Message sent. We will contact you soon.')
            form?.reset()
          } catch (err) {
            setError(err.message || 'Failed to send')
          } finally {
            setBusy(false)
          }
        }}
      >
        <h2 className="contact__form-title">Send a Message</h2>
        {status ? <p className="contact__status contact__status--ok">{status}</p> : null}
        {error ? <p className="contact__status contact__status--err">{error}</p> : null}
        <div className="contact__fields">
          <label className="contact__field">
            <span>Full Name</span>
            <input type="text" name="name" placeholder="Your name" required autoComplete="name" />
          </label>
          <label className="contact__field">
            <span>Phone</span>
            <input
              type="tel"
              name="phone"
              placeholder="+91 98765 43210"
              required
              autoComplete="tel"
              pattern="[0-9+\s\-()]{8,18}"
            />
          </label>
          <label className="contact__field contact__field--full">
            <span>Message</span>
            <textarea name="message" rows={5} placeholder="How can we help?" required />
          </label>
        </div>
        <button type="submit" className="btn btn-primary contact__submit" disabled={busy}>
          <Send size={16} strokeWidth={2} />
          {busy ? 'Sending…' : 'Send Message'}
        </button>
      </form>
    </PageShell>
  )
}
