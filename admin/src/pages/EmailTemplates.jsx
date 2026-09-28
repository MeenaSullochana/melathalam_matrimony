import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

export default function EmailTemplates({ mode = 'list' }) {
  const { token } = useAuth()
  const [templates, setTemplates] = useState([])
  const [form, setForm] = useState({ template_name: '', subject: '', body: '' })
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api('/api/admin/cms/email-templates', { token })
      .then((res) => setTemplates(res.templates || []))
      .catch((err) => setMsg(err.message))
      .finally(() => setLoading(false))
  }, [token])

  async function submit(e) {
    e.preventDefault()
    setMsg('')
    try {
      await api('/api/admin/cms/email-templates', { method: 'POST', token, body: form })
      setMsg('Template saved (if API route is enabled)')
      setForm({ template_name: '', subject: '', body: '' })
    } catch (err) {
      setMsg(err.message || 'Save endpoint may not exist yet — form captured locally.')
    }
  }

  const showForm = mode === 'new' || mode === 'create'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink-900">Email templates</h1>
        <p className="text-sm text-ink-500">{templates.length} templates</p>
      </div>

      {msg ? <p className="text-sm text-brand-800">{msg}</p> : null}

      {showForm ? (
        <form className="card space-y-4 p-6" onSubmit={submit}>
          <h2 className="font-semibold">New template</h2>
          <div>
            <label className="label">Template name</label>
            <input className="input" value={form.template_name} onChange={(e) => setForm((f) => ({ ...f, template_name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Subject</label>
            <input className="input" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
          </div>
          <div>
            <label className="label">Body (HTML)</label>
            <textarea className="input min-h-[160px] font-mono text-xs" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
          </div>
          <button type="submit" className="btn-primary">Save template</button>
        </form>
      ) : null}

      <div className="card overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Subject</th>
                <th>Preview</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center">Loading…</td>
                </tr>
              ) : templates.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-ink-500">No templates in database.</td>
                </tr>
              ) : (
                templates.map((t, i) => (
                  <tr key={t.template_id || t._id || i}>
                    <td className="font-medium">{t.template_name || t.name || '—'}</td>
                    <td>{t.subject || t.email_subject || '—'}</td>
                    <td className="max-w-md truncate text-ink-500">{t.body || t.email_content || '—'}</td>
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
