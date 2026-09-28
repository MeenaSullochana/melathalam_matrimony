import { useEffect, useId, useState } from 'react'
import { MessageSquareText, Phone, User, X } from 'lucide-react'
import brandLogo from '../assets/logo/logo.png'
import attarImage from '../assets/enquiry/enquiry-attar.png'
import { api } from '../api'
import './EnquiryPopup.css'

const INITIAL = { name: '', phone: '', message: '' }

export default function EnquiryPopup({ open, onClose }) {
  const titleId = useId()
  const [form, setForm] = useState(INITIAL)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api('/api/public/enquiry', {
        method: 'POST',
        body: {
          name: form.name,
          phone: form.phone,
          message: form.message,
        },
      })
      setSent(true)
      setForm(INITIAL)
    } catch (err) {
      alert(err.message || 'Failed to submit enquiry. Please try again.')
    }
  }

  return (
    <div className="enquiry-popup" role="presentation" onClick={onClose}>
      <div
        className="enquiry-popup__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="enquiry-popup__close"
          onClick={onClose}
          aria-label="Close enquiry"
        >
          <X size={18} strokeWidth={2.2} />
        </button>

        <div className="enquiry-popup__media" aria-hidden="true">
          <img src={attarImage} alt="" className="enquiry-popup__photo" />
          <div className="enquiry-popup__media-fade" />
          <p className="enquiry-popup__media-script">Find your forever</p>
        </div>

        <div className="enquiry-popup__panel">
          <img
            src={brandLogo}
            alt="Melathalam Matrimony"
            className="enquiry-popup__logo"
            width={220}
            height={50}
            decoding="async"
          />

          <h2 id={titleId} className="enquiry-popup__title">
            Quick Enquiry
          </h2>
          <p className="enquiry-popup__subtitle">
            Share your details — our matchmakers will reach out soon.
          </p>

          {sent ? (
            <div className="enquiry-popup__success" role="status">
              <p className="enquiry-popup__success-title">Thank you</p>
              <p className="enquiry-popup__success-text">
                We have received your enquiry. Our team will contact you shortly.
              </p>
              <button type="button" className="btn btn-primary enquiry-popup__submit" onClick={onClose}>
                Close
              </button>
            </div>
          ) : (
            <form className="enquiry-popup__form" onSubmit={handleSubmit}>
              <label className="enquiry-popup__field">
                <span className="enquiry-popup__label">Name</span>
                <span className="enquiry-popup__control">
                  <User size={16} strokeWidth={2} aria-hidden="true" />
                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={update('name')}
                    required
                    autoComplete="name"
                  />
                </span>
              </label>

              <label className="enquiry-popup__field">
                <span className="enquiry-popup__label">Phone</span>
                <span className="enquiry-popup__control">
                  <Phone size={16} strokeWidth={2} aria-hidden="true" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={update('phone')}
                    required
                    autoComplete="tel"
                    pattern="[0-9+\s\-()]{8,18}"
                  />
                </span>
              </label>

              <label className="enquiry-popup__field">
                <span className="enquiry-popup__label">Message</span>
                <span className="enquiry-popup__control enquiry-popup__control--area">
                  <MessageSquareText size={16} strokeWidth={2} aria-hidden="true" />
                  <textarea
                    name="message"
                    placeholder="Tell us how we can help…"
                    value={form.message}
                    onChange={update('message')}
                    required
                    rows={3}
                  />
                </span>
              </label>

              <button type="submit" className="btn btn-primary enquiry-popup__submit">
                Submit Enquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
