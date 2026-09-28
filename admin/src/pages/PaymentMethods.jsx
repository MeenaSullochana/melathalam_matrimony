import { useCallback, useEffect, useState } from 'react'
import { CreditCard, Landmark, Upload } from 'lucide-react'
import { api, API_BASE } from '../lib/api'
import { useAuth } from '../lib/auth'

function qrUrl(name) {
  if (!name) return null
  if (String(name).startsWith('http')) return name
  return `${API_BASE}/img/qr/${name}`
}

export default function PaymentMethods() {
  const { token } = useAuth()
  const [methods, setMethods] = useState([])
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [qrFile, setQrFile] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    Promise.all([
      api('/api/admin/settings/payment-method', { token }),
      api('/api/admin/plans/payments/list?page=1', { token }).catch(() => ({ payments: [] })),
    ])
      .then(([m, p]) => {
        setMethods(m.methods || [])
        setPending((p.payments || []).filter((x) => /pending|awaiting/i.test(String(x.status || ''))))
      })
      .catch((err) => setMsg(err.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  const bank = methods.find((m) => Number(m.pay_id) === 1) || { pay_id: 1, pay_name: 'Bank / Manual / QR', status: 'ACTIVE' }
  const gateway = methods.find((m) => Number(m.pay_id) === 2) || { pay_id: 2, pay_name: 'Razorpay', status: 'ACTIVE' }

  async function saveBank(e) {
    e.preventDefault()
    setMsg('')
    const fd = new FormData(e.currentTarget)
    const body = {
      pay_id: 1,
      pay_name: 'Bank / Manual / QR',
      status: fd.get('status'),
      bank_name: fd.get('bank_name'),
      bank_account_no: fd.get('bank_account_no'),
      bank_account_name: fd.get('bank_account_name'),
      bank_account_type: fd.get('bank_account_type'),
      bank_ifsc: fd.get('bank_ifsc'),
      payment_phone: fd.get('payment_phone'),
      payment_qr: bank.payment_qr || '',
    }
    try {
      await api('/api/admin/settings/payment-method/1', { method: 'PUT', token, body })
      if (qrFile) {
        const form = new FormData()
        form.append('payment_qr', qrFile)
        await api('/api/admin/settings/payment-method/1/qr', { method: 'POST', token, formData: form })
        setQrFile(null)
      }
      setMsg('Manual / QR payment saved')
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function saveGateway(e) {
    e.preventDefault()
    setMsg('')
    const fd = new FormData(e.currentTarget)
    try {
      await api('/api/admin/settings/payment-method/2', {
        method: 'PUT',
        token,
        body: {
          pay_id: 2,
          pay_name: 'Razorpay',
          status: fd.get('status'),
          razorpay_key: fd.get('razorpay_key'),
          razorpay_secret: fd.get('razorpay_secret'),
        },
      })
      setMsg('Gateway keys updated (only keys — no other gateway config)')
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function approve(payid) {
    try {
      await api(`/api/payments/admin/approve/${payid}`, { method: 'POST', token })
      setMsg(`Payment #${payid} approved`)
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  if (loading) return <p className="text-sm text-ink-500">Loading payment options…</p>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-ink-900">Payment options</h1>
        <p className="text-sm text-ink-500">
          Members can choose Razorpay gateway or Manual bank/QR. Update keys &amp; QR only here.
        </p>
      </div>

      {msg ? <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">{msg}</p> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <form className="card space-y-4 p-6" onSubmit={saveGateway}>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-100 p-2 text-brand-700"><CreditCard size={20} /></div>
            <div>
              <h2 className="font-semibold text-ink-900">Razorpay (Gateway)</h2>
              <p className="text-xs text-ink-500">Only API key &amp; secret — status on/off</p>
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" name="status" defaultValue={gateway.status || 'ACTIVE'}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <div>
            <label className="label">Razorpay Key ID</label>
            <input className="input font-mono text-sm" name="razorpay_key" defaultValue={gateway.razorpay_key || ''} placeholder="rzp_live_…" />
          </div>
          <div>
            <label className="label">Razorpay Secret</label>
            <input className="input font-mono text-sm" name="razorpay_secret" type="password" defaultValue={gateway.razorpay_secret || ''} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn-primary">Save gateway keys</button>
        </form>

        <form className="card space-y-4 p-6" onSubmit={saveBank}>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-100 p-2 text-amber-800"><Landmark size={20} /></div>
            <div>
              <h2 className="font-semibold text-ink-900">Manual / Bank / QR</h2>
              <p className="text-xs text-ink-500">UPI QR image + bank account details</p>
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" name="status" defaultValue={bank.status || 'ACTIVE'}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['bank_name', 'Bank name'],
              ['bank_account_name', 'Account name'],
              ['bank_account_no', 'Account number'],
              ['bank_account_type', 'Account type'],
              ['bank_ifsc', 'IFSC'],
              ['payment_phone', 'UPI / Phone'],
            ].map(([name, label]) => (
              <div key={name}>
                <label className="label">{label}</label>
                <input className="input" name={name} defaultValue={bank[name] || ''} />
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-ink-100 p-4">
            <label className="label">Payment QR image</label>
            <div className="flex flex-wrap items-center gap-4">
              {bank.payment_qr || qrFile ? (
                <img
                  src={qrFile ? URL.createObjectURL(qrFile) : qrUrl(bank.payment_qr)}
                  alt="QR"
                  className="h-28 w-28 rounded-lg border object-contain bg-white"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-ink-100 text-xs text-ink-500">No QR</div>
              )}
              <label className="btn-secondary cursor-pointer">
                <Upload size={16} /> Upload QR
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setQrFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>
          <button type="submit" className="btn-primary">Save manual payment</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-ink-100 px-5 py-4">
          <h2 className="font-semibold text-ink-900">Manual payments awaiting approval</h2>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Member</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr><td colSpan={6} className="py-6 text-center text-ink-500">No pending manual payments</td></tr>
              ) : (
                pending.map((p) => (
                  <tr key={p.payid || p._id}>
                    <td>{p.payid}</td>
                    <td>{p.matri_id}</td>
                    <td>{p.plan_name}</td>
                    <td>{p.plan_amount}</td>
                    <td><span className="badge-warn">{p.status}</span></td>
                    <td>
                      <button type="button" className="btn-ok px-2 py-1 text-xs" onClick={() => approve(p.payid)}>
                        Approve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
