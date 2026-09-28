import { useEffect, useState } from 'react'
import { CalendarDays, Eye, Phone, Sparkles, Check, Landmark, CreditCard } from 'lucide-react'
import { api, API_BASE } from '../../api'
import { useAuth } from '../../auth'
import './user-pages.css'

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

function qrUrl(name) {
  if (!name) return null
  if (String(name).startsWith('http')) return name
  return `${API_BASE}/img/qr/${name}`
}

export default function Upgrade() {
  const { member, token, refresh } = useAuth()
  const [packages, setPackages] = useState([])
  const [methods, setMethods] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [payId, setPayId] = useState('')
  const [checkout, setCheckout] = useState(null)
  const [txn, setTxn] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [planInfo, setPlanInfo] = useState(null)

  useEffect(() => {
    api('/api/public/plans')
      .then((d) => setPackages(d.plans || []))
      .catch(() => setPackages([]))
    api('/api/payments/methods')
      .then((d) => {
        const list = d.methods || []
        setMethods(list)
        if (list[0]) setPayId(String(list[0].pay_id))
      })
      .catch(() => setMethods([]))
    if (token) {
      api('/api/member/plan', { token })
        .then((d) => setPlanInfo(d.plan))
        .catch(() => {})
    }
  }, [token])

  async function requestRenewal(plan) {
    setBusy(true)
    setMsg('')
    try {
      const res = await api('/api/member/renewal-request', {
        method: 'POST',
        token,
        body: { plan_id: plan?.plan_id || member?.plan_id, note: 'Membership renewal requested' },
      })
      setMsg(res.message || 'Renewal request submitted for admin approval')
    } catch (e) {
      setMsg(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function startCheckout(plan) {
    if (!payId) {
      setMsg('Select a payment method')
      return
    }
    setBusy(true)
    setMsg('')
    setSelectedPlan(plan)
    try {
      const res = await api('/api/payments/checkout', {
        method: 'POST',
        token,
        body: { plan_id: plan.plan_id, pay_id: Number(payId) },
      })
      setCheckout(res)
      if (Number(payId) === 2 && res.razorpay?.key) {
        const ok = await loadRazorpay()
        if (!ok) {
          setMsg('Could not load Razorpay. Check key in admin or use Manual payment.')
          return
        }
        const rzp = new window.Razorpay({
          key: res.razorpay.key,
          amount: res.razorpay.amount,
          currency: res.razorpay.currency || 'INR',
          name: 'Melathalam Matrimony',
          description: res.razorpay.description,
          handler: async (response) => {
            await api('/api/payments/gateway-confirm', {
              method: 'POST',
              token,
              body: {
                payid: res.payment.payid,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
            })
            setMsg('Payment successful. Membership activated.')
            setCheckout(null)
            refresh?.()
          },
        })
        rzp.open()
      }
    } catch (e) {
      setMsg(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function submitManual() {
    if (!checkout?.payment?.payid) return
    setBusy(true)
    try {
      await api('/api/payments/manual-confirm', {
        method: 'POST',
        token,
        body: { payid: checkout.payment.payid, txn_ref: txn, note: 'Manual bank/UPI payment' },
      })
      setMsg('Submitted. Admin will approve and activate your plan.')
      setCheckout(null)
      setTxn('')
    } catch (e) {
      setMsg(e.message)
    } finally {
      setBusy(false)
    }
  }

  const method = methods.find((m) => String(m.pay_id) === String(payId))

  return (
    <div className="user-page">
      <section className="user-panel upgrade-banner">
        <div>
          <h2 className="user-panel__title">Membership</h2>
          <p className="user-panel__sub">
            Choose a plan, then pay via Razorpay or Manual bank/QR (whichever admin enabled).
          </p>
        </div>
        <div className="upgrade-banner__chip">
          <Sparkles size={16} />
          {member?.status || 'Active'} · ID {member?.matri_id}
        </div>
      </section>

      {planInfo ? (
        <section className="user-panel" style={{ marginBottom: 16 }}>
          <h3 className="user-panel__title" style={{ fontSize: 18 }}>Current plan usage</h3>
          <ul className="upgrade-card__features" style={{ marginTop: 12 }}>
            <li>
              Plan: <strong>{planInfo.plan_name || '—'}</strong> · Expires {planInfo.plan_expired_on || '—'}
              {planInfo.expired ? ' (Expired)' : ''}
            </li>
            <li>
              <Eye size={15} /> Profile views: <strong>{planInfo.profilesUsed}/{planInfo.profilesTotal}</strong> (left {planInfo.profilesLeft})
            </li>
            <li>
              <Phone size={15} /> Contacts: <strong>{planInfo.contactsUsed}/{planInfo.contactsTotal}</strong> (left {planInfo.contactsLeft})
            </li>
          </ul>
          <button type="button" className="btn btn-outline" style={{ marginTop: 12 }} disabled={busy} onClick={() => requestRenewal()}>
            Request renewal (admin approval)
          </button>
        </section>
      ) : null}

      {msg ? <p className="user-panel" style={{ color: '#0f766e' }}>{msg}</p> : null}

      <section className="user-panel" style={{ marginBottom: 16 }}>
        <h3 className="user-panel__title" style={{ fontSize: 18 }}>Payment method</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
          {methods.map((m) => (
            <button
              key={m.pay_id}
              type="button"
              className={`btn ${String(payId) === String(m.pay_id) ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setPayId(String(m.pay_id))}
            >
              {Number(m.pay_id) === 2 ? <CreditCard size={14} /> : <Landmark size={14} />}
              {m.pay_name || (Number(m.pay_id) === 2 ? 'Razorpay' : 'Manual / QR')}
            </button>
          ))}
          {!methods.length ? <p className="user-panel__sub">No payment methods active. Ask admin to configure.</p> : null}
        </div>
      </section>

      <div className="upgrade-grid">
        {packages.map((pkg, i) => (
          <article key={pkg.plan_id} className={`upgrade-card ${i === 1 ? 'upgrade-card--featured' : ''}`}>
            {i === 1 ? <span className="upgrade-card__badge">Popular</span> : null}
            <h3 className="upgrade-card__name">{pkg.plan_name}</h3>
            <p className="upgrade-card__price">
              <span>Rs.</span>
              {Number(pkg.plan_amount).toLocaleString('en-IN')}
            </p>
            <ul className="upgrade-card__features">
              <li><CalendarDays size={15} /> Duration: <strong>{pkg.plan_duration} Days</strong></li>
              <li><Phone size={15} /> Contacts: <strong>{pkg.plan_contacts}</strong></li>
              <li><Eye size={15} /> Profile views: <strong>{pkg.profile}</strong></li>
              <li><Check size={15} /> Verified support</li>
            </ul>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary upgrade-card__cta"
                disabled={busy || !payId}
                onClick={() => startCheckout(pkg)}
              >
                {busy && selectedPlan?.plan_id === pkg.plan_id ? 'Processing…' : 'Choose & pay'}
              </button>
              <button type="button" className="btn btn-outline" disabled={busy} onClick={() => requestRenewal(pkg)}>
                Request renew (admin)
              </button>
            </div>
          </article>
        ))}
        {!packages.length ? <p className="user-panel__sub">Loading plans…</p> : null}
      </div>

      {checkout && Number(payId) === 1 ? (
        <section className="user-panel" style={{ marginTop: 20 }}>
          <h3 className="user-panel__title" style={{ fontSize: 18 }}>Complete manual payment</h3>
          <p className="user-panel__sub">Pay using bank / UPI QR, then submit reference for admin approval.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 20, marginTop: 16 }}>
            {method?.payment_qr ? (
              <img src={qrUrl(method.payment_qr)} alt="QR" style={{ width: 160, height: 160, objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: 12 }} />
            ) : (
              <div style={{ width: 160, height: 160, background: '#f1f5f9', display: 'grid', placeItems: 'center', borderRadius: 12 }}>No QR</div>
            )}
            <div>
              <p><strong>Bank:</strong> {method?.bank_name || '—'}</p>
              <p><strong>Account:</strong> {method?.bank_account_name} · {method?.bank_account_no}</p>
              <p><strong>IFSC:</strong> {method?.bank_ifsc || '—'}</p>
              <p><strong>UPI/Phone:</strong> {method?.payment_phone || '—'}</p>
              <p><strong>Amount:</strong> Rs. {checkout.plan?.plan_amount}</p>
              <label className="user-field" style={{ marginTop: 12, display: 'block' }}>
                <span>Transaction / UTR reference</span>
                <input value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="Enter UTR / Ref no." />
              </label>
              <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} disabled={busy} onClick={submitManual}>
                I have paid — Submit
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
