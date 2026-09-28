import { useCallback, useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

export default function Cms() {
  const { token } = useAuth()
  const [pages, setPages] = useState([])
  const [form, setForm] = useState({ cms_title: '', page_name: '', cms_content: '', status: 'APPROVED' })
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api('/api/admin/cms/pages', { token })
      .then((res) => setPages(res.pages || []))
      .catch((err) => setMsg(err.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  async function save(e) {
    e.preventDefault()
    setMsg('')
    try {
      if (editId) {
        await api(`/api/admin/cms/pages/${editId}`, { method: 'PUT', token, body: form })
      } else {
        await api('/api/admin/cms/pages', { method: 'POST', token, body: form })
      }
      setForm({ cms_title: '', page_name: '', cms_content: '', status: 'APPROVED' })
      setEditId(null)
      setMsg('Saved')
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete page?')) return
    await api(`/api/admin/cms/pages/${id}`, { method: 'DELETE', token })
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink-900">CMS pages</h1>
        <p className="text-sm text-ink-500">Static content for the public site</p>
      </div>

      {msg ? <p className="text-sm text-brand-800">{msg}</p> : null}

      <form className="card space-y-4 p-6" onSubmit={save}>
        <h2 className="font-semibold">{editId ? `Edit page #${editId}` : 'Add page'}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Title</label>
            <input className="input" value={form.cms_title} onChange={(e) => setForm((f) => ({ ...f, cms_title: e.target.value, page_name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
              <option value="APPROVED">Published</option>
              <option value="UNAPPROVED">Draft</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Content (HTML)</label>
          <textarea className="input min-h-[160px] font-mono text-xs" value={form.cms_content} onChange={(e) => setForm((f) => ({ ...f, cms_content: e.target.value }))} />
        </div>
        <button type="submit" className="btn-primary">{editId ? 'Update' : 'Create'}</button>
      </form>

      <div className="card overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center">Loading…</td>
                </tr>
              ) : (
                pages.map((p) => (
                  <tr key={p.cms_id}>
                    <td>{p.cms_id}</td>
                    <td>{p.cms_title || p.page_name}</td>
                    <td><span className={p.status === 'APPROVED' ? 'badge-ok' : 'badge-warn'}>{p.status}</span></td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn-secondary px-2 py-1 text-xs"
                          onClick={() => {
                            setEditId(p.cms_id)
                            setForm({
                              cms_title: p.cms_title || '',
                              page_name: p.page_name || '',
                              cms_content: p.cms_content || '',
                              status: p.status || 'APPROVED',
                            })
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                        <button type="button" className="btn-danger px-2 py-1 text-xs" onClick={() => remove(p.cms_id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
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
