import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api, API_BASE, siteAssetUrl } from '../lib/api'
import { useAuth } from '../lib/auth'
import DataTable from '../components/DataTable'

const EMPTY = { title: '', text: '', sort_order: '0', status: 'APPROVED', image: '' }

export default function Services() {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState(null)
  const [editId, setEditId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api('/api/admin/cms/services', { token })
      .then((res) => setItems(res.services || []))
      .catch((err) => setMsg(err.message))
      .finally(() => setLoading(false))
  }, [token])

  useEffect(() => {
    load()
  }, [load])

  function startCreate() {
    setCreating(true)
    setEditId(null)
    setForm(EMPTY)
    setFile(null)
    setMsg('')
  }

  function startEdit(row) {
    setCreating(true)
    setEditId(row.service_id)
    setForm({
      title: row.title || '',
      text: row.text || '',
      sort_order: String(row.sort_order ?? 0),
      status: row.status || 'APPROVED',
      image: row.image || '',
    })
    setFile(null)
    setMsg('')
  }

  async function save(e) {
    e.preventDefault()
    setMsg('')
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('text', form.text)
      fd.append('sort_order', form.sort_order)
      fd.append('status', form.status)
      if (file) fd.append('image', file)
      else if (form.image) fd.append('image', form.image)

      if (editId) {
        await api(`/api/admin/cms/services/${editId}`, { method: 'PUT', token, formData: fd })
        setMsg('Service updated')
      } else {
        await api('/api/admin/cms/services', { method: 'POST', token, formData: fd })
        setMsg('Service created')
      }
      setCreating(false)
      setEditId(null)
      setForm(EMPTY)
      setFile(null)
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this service?')) return
    try {
      await api(`/api/admin/cms/services/${id}`, { method: 'DELETE', token })
      setMsg('Deleted')
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  const columns = [
    {
      key: 'image',
      label: 'Image',
      export: false,
      render: (row) =>
        row.image ? (
          <img
            src={siteAssetUrl(row.image) || `${API_BASE}/img/${row.image}`}
            alt=""
            className="h-12 w-16 rounded object-cover"
          />
        ) : (
          <span className="text-ink-400">—</span>
        ),
    },
    { key: 'title', label: 'Title' },
    {
      key: 'text',
      label: 'Description',
      render: (row) => <span className="line-clamp-2 max-w-md text-sm text-ink-600">{row.text}</span>,
    },
    { key: 'sort_order', label: 'Order' },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: '',
      export: false,
      render: (row) => (
        <div className="flex gap-1">
          <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => startEdit(row)} title="Edit">
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className="btn-secondary px-2 py-1 text-xs text-red-700"
            onClick={() => remove(row.service_id)}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink-900">Services</h1>
          <p className="text-sm text-ink-500">Shown on the home page and Services page</p>
        </div>
        {!creating ? (
          <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={startCreate}>
            <Plus size={16} /> Add service
          </button>
        ) : null}
      </div>
      {msg ? <p className="text-sm text-brand-800">{msg}</p> : null}

      {creating ? (
        <form className="card grid gap-4 p-6 sm:grid-cols-2" onSubmit={save}>
          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input
              className="input"
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea
              className="input min-h-[100px]"
              required
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Sort order</label>
            <input
              className="input"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="APPROVED">APPROVED</option>
              <option value="UNAPPROVED">UNAPPROVED</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Image</label>
            <input
              type="file"
              accept="image/*"
              className="input"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {form.image && !file ? (
              <img
                src={siteAssetUrl(form.image)}
                alt=""
                className="mt-2 h-20 w-28 rounded object-cover"
              />
            ) : null}
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="btn-primary">
              {editId ? 'Update service' : 'Create service'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setCreating(false)
                setEditId(null)
                setForm(EMPTY)
                setFile(null)
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <DataTable
        columns={columns}
        rows={items}
        loading={loading}
        exportFileName="services"
        rowKey={(r) => r.service_id}
      />
    </div>
  )
}
