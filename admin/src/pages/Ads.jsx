import { useCallback, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

export default function Ads() {
  const { token } = useAuth()
  const [ads, setAds] = useState([])
  const [form, setForm] = useState({
    adv_name: '',
    adv_link: '',
    adv_level: '1',
    adv_img: '',
    contact_name: '',
    phone: '',
    status: 'APPROVED',
  })
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api('/api/admin/cms/ads', { token })
      .then((res) => setAds(res.ads || []))
      .catch((err) => setMsg(err.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  async function save(e) {
    e.preventDefault()
    try {
      if (editId) {
        await api(`/api/admin/cms/ads/${editId}`, { method: 'PUT', token, body: form })
      } else {
        await api('/api/admin/cms/ads', { method: 'POST', token, body: form })
      }
      setEditId(null)
      setForm({ adv_name: '', adv_link: '', adv_level: '1', adv_img: '', contact_name: '', phone: '', status: 'APPROVED' })
      setMsg('Saved')
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink-900">Advertisements</h1>
        <p className="text-sm text-ink-500">Banner slots and sponsor links</p>
      </div>
      {msg ? <p className="text-sm text-brand-800">{msg}</p> : null}

      <form className="card grid gap-4 p-6 sm:grid-cols-2" onSubmit={save}>
        {[
          ['adv_name', 'Ad name'],
          ['adv_link', 'Link URL'],
          ['adv_level', 'Level / slot'],
          ['adv_img', 'Image filename'],
          ['contact_name', 'Contact name'],
          ['phone', 'Phone'],
        ].map(([key, label]) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input className="input" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
          </div>
        ))}
        <div className="sm:col-span-2">
          <button type="submit" className="btn-primary">{editId ? 'Update ad' : 'Add ad'}</button>
        </div>
      </form>

      <div className="card overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Link</th>
                <th>Level</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>Loading…</td>
                </tr>
              ) : (
                ads.map((a) => (
                  <tr key={a.adv_id}>
                    <td>{a.adv_id}</td>
                    <td>{a.adv_name}</td>
                    <td className="max-w-xs truncate text-brand-700">{a.adv_link}</td>
                    <td>{a.adv_level}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-secondary mr-2 px-2 py-1 text-xs"
                        onClick={() => {
                          setEditId(a.adv_id)
                          setForm({
                            adv_name: a.adv_name || '',
                            adv_link: a.adv_link || '',
                            adv_level: a.adv_level || '1',
                            adv_img: a.adv_img || '',
                            contact_name: a.contact_name || '',
                            phone: a.phone || '',
                            status: a.status || 'APPROVED',
                          })
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger px-2 py-1 text-xs"
                        onClick={async () => {
                          await api(`/api/admin/cms/ads/${a.adv_id}`, { method: 'DELETE', token })
                          load()
                        }}
                      >
                        <Trash2 size={14} />
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
