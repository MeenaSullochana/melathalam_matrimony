import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api, API_BASE } from '../lib/api'
import { useAuth } from '../lib/auth'
import DataTable from '../components/DataTable'

const EMPTY = {
  bridename: '',
  groomname: '',
  brideid: '',
  groomid: '',
  marriagedate: '',
  engagement_date: '',
  address: '',
  country: '',
  successmessage: '',
  status: 'APPROVED',
  weddingphoto: '',
}

function storyPhotoUrl(name) {
  if (!name) return null
  if (String(name).startsWith('http')) return name
  return `${API_BASE}/SuccessStory/${String(name).replace(/^\//, '')}`
}

export default function SuccessStoriesManage() {
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
    api('/api/admin/cms/success-stories', { token })
      .then((res) => setItems(res.stories || []))
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
    setEditId(row.story_id)
    setForm({
      bridename: row.bridename || '',
      groomname: row.groomname || '',
      brideid: row.brideid || '',
      groomid: row.groomid || '',
      marriagedate: row.marriagedate || '',
      engagement_date: row.engagement_date || '',
      address: row.address || '',
      country: row.country || '',
      successmessage: row.successmessage || '',
      status: row.status || 'APPROVED',
      weddingphoto: row.weddingphoto || '',
    })
    setFile(null)
    setMsg('')
  }

  async function save(e) {
    e.preventDefault()
    setMsg('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'weddingphoto') return
        fd.append(k, v ?? '')
      })
      if (file) fd.append('weddingphoto', file)
      else if (form.weddingphoto) fd.append('weddingphoto', form.weddingphoto)

      if (editId) {
        await api(`/api/admin/cms/success-stories/${editId}`, { method: 'PUT', token, formData: fd })
        setMsg('Story updated')
      } else {
        await api('/api/admin/cms/success-stories', { method: 'POST', token, formData: fd })
        setMsg('Story created')
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
    if (!window.confirm('Delete this success story?')) return
    try {
      await api(`/api/admin/cms/success-stories/${id}`, { method: 'DELETE', token })
      setMsg('Deleted')
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  const columns = [
    {
      key: 'weddingphoto',
      label: 'Photo',
      export: false,
      render: (row) =>
        row.weddingphoto ? (
          <img src={storyPhotoUrl(row.weddingphoto)} alt="" className="h-12 w-16 rounded object-cover" />
        ) : (
          <span className="text-ink-400">—</span>
        ),
    },
    {
      key: 'couple',
      label: 'Couple',
      getValue: (row) => `${row.groomname || ''} & ${row.bridename || ''}`,
      render: (row) => (
        <span>
          {row.groomname || '—'} & {row.bridename || '—'}
        </span>
      ),
    },
    { key: 'marriagedate', label: 'Marriage date' },
    {
      key: 'place',
      label: 'Place',
      getValue: (row) => row.address || row.country || '',
      render: (row) => row.address || row.country || '—',
    },
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
            onClick={() => remove(row.story_id)}
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
          <h1 className="font-display text-2xl text-ink-900">Success Stories</h1>
          <p className="text-sm text-ink-500">Create and manage stories shown on the website</p>
        </div>
        {!creating ? (
          <button type="button" className="btn-primary inline-flex items-center gap-2" onClick={startCreate}>
            <Plus size={16} /> Add story
          </button>
        ) : null}
      </div>
      {msg ? <p className="text-sm text-brand-800">{msg}</p> : null}

      {creating ? (
        <form className="card grid gap-4 p-6 sm:grid-cols-2" onSubmit={save}>
          <div>
            <label className="label">Groom name</label>
            <input
              className="input"
              required
              value={form.groomname}
              onChange={(e) => setForm((f) => ({ ...f, groomname: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Bride name</label>
            <input
              className="input"
              required
              value={form.bridename}
              onChange={(e) => setForm((f) => ({ ...f, bridename: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Groom ID (optional)</label>
            <input
              className="input"
              value={form.groomid}
              onChange={(e) => setForm((f) => ({ ...f, groomid: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Bride ID (optional)</label>
            <input
              className="input"
              value={form.brideid}
              onChange={(e) => setForm((f) => ({ ...f, brideid: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Marriage date</label>
            <input
              className="input"
              type="date"
              value={form.marriagedate}
              onChange={(e) => setForm((f) => ({ ...f, marriagedate: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Engagement date</label>
            <input
              className="input"
              type="date"
              value={form.engagement_date}
              onChange={(e) => setForm((f) => ({ ...f, engagement_date: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">City / address</label>
            <input
              className="input"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Country</label>
            <input
              className="input"
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Success message</label>
            <textarea
              className="input min-h-[100px]"
              required
              value={form.successmessage}
              onChange={(e) => setForm((f) => ({ ...f, successmessage: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="APPROVED">APPROVED (visible on site)</option>
              <option value="UNAPPROVED">UNAPPROVED (hidden)</option>
            </select>
          </div>
          <div>
            <label className="label">Wedding photo</label>
            <input
              type="file"
              accept="image/*"
              className="input"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {form.weddingphoto && !file ? (
              <img
                src={storyPhotoUrl(form.weddingphoto)}
                alt=""
                className="mt-2 h-20 w-28 rounded object-cover"
              />
            ) : null}
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="btn-primary">
              {editId ? 'Update story' : 'Create story'}
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
        exportFileName="success-stories"
        rowKey={(r) => r.story_id}
      />
    </div>
  )
}
