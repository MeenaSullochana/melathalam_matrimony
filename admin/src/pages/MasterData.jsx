import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import DataTable from '../components/DataTable'

const LABELS = {
  religion: 'Religion',
  caste: 'Caste',
  'sub-caste': 'Sub Caste',
  country: 'Country',
  state: 'State',
  city: 'City',
  occupation: 'Occupation',
  education: 'Education',
  'mother-tongue': 'Mother Tongue',
  height: 'Height',
  weight: 'Weight',
  diet: 'Diet',
  complexion: 'Complexion',
  'body-type': 'Body Type',
}

function itemName(row) {
  return row.name || '—'
}

function itemId(type, row) {
  const key = type.replace(/-/g, '_')
  return row[`${key}_id`] ?? row.legacy_id
}

export default function MasterData({ type }) {
  const { token } = useAuth()
  const [items, setItems] = useState([])
  const [name, setName] = useState('')
  const [status, setStatus] = useState('APPROVED')
  const [religionId, setReligionId] = useState('')
  const [countryId, setCountryId] = useState('')
  const [stateId, setStateId] = useState('')
  const [religions, setReligions] = useState([])
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const title = useMemo(() => LABELS[type] || type, [type])
  const needsReligion = type === 'caste'
  const needsCountry = type === 'state' || type === 'city'
  const needsState = type === 'city'

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (type === 'caste' && religionId) params.set('religion_id', religionId)
    if (type === 'state' && countryId) params.set('country_id', countryId)
    if (type === 'city' && stateId) params.set('state_id', stateId)
    const qs = params.toString() ? `?${params}` : ''
    api(`/api/admin/master/${type}${qs}`, { token })
      .then((res) => setItems(res.items || []))
      .catch((err) => setMsg(err.message))
      .finally(() => setLoading(false))
  }, [token, type, religionId, countryId, stateId])

  useEffect(() => {
    setEditId(null)
    setName('')
    setReligionId('')
    setCountryId('')
    setStateId('')
  }, [type])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (needsReligion || type === 'religion') {
      api('/api/admin/master/religion', { token }).then((r) => setReligions(r.items || [])).catch(() => {})
    }
    if (needsCountry) {
      api('/api/admin/master/country', { token }).then((r) => setCountries(r.items || [])).catch(() => {})
    }
  }, [token, needsReligion, needsCountry, type])

  useEffect(() => {
    if (!needsState || !countryId) {
      setStates([])
      return
    }
    api(`/api/admin/master/state?country_id=${encodeURIComponent(countryId)}`, { token })
      .then((r) => setStates(r.items || []))
      .catch(() => setStates([]))
  }, [needsState, countryId, token])

  function resetForm() {
    setEditId(null)
    setName('')
    setStatus('APPROVED')
  }

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setMsg('')
    try {
      const body = { name: name.trim(), status }
      if (needsReligion) {
        if (!religionId) throw new Error('Select religion')
        body.religion_id = religionId
      }
      if (type === 'state') {
        if (!countryId) throw new Error('Select country')
        body.country_id = countryId
        body.country_code = countryId
      }
      if (type === 'city') {
        if (!countryId) throw new Error('Select country')
        if (!stateId) throw new Error('Select state')
        body.country_id = countryId
        body.country_code = countryId
        body.state_id = stateId
        body.state_code = stateId
      }
      if (editId) {
        await api(`/api/admin/master/${type}/${editId}`, { method: 'PUT', token, body })
        setMsg('Updated successfully')
      } else {
        await api(`/api/admin/master/${type}`, { method: 'POST', token, body })
        setMsg('Added successfully')
      }
      resetForm()
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this entry?')) return
    setMsg('')
    try {
      await api(`/api/admin/master/${type}/${id}`, { method: 'DELETE', token })
      load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  function startEdit(row) {
    setEditId(itemId(type, row))
    setName(itemName(row))
    setStatus(row.status || 'APPROVED')
    if (row.religion_id) setReligionId(String(row.religion_id).trim())
    if (row.country_code || row.country_id) setCountryId(String(row.country_code || row.country_id).trim())
    if (row.state_code || row.state_id) setStateId(String(row.state_code || row.state_id).trim())
  }

  const columns = useMemo(() => {
    const cols = [
      { key: 'id', label: 'ID', getValue: (row) => itemId(type, row) },
      {
        key: 'name',
        label: 'Name',
        getValue: itemName,
        render: (row) => <span className="font-medium text-ink-900">{itemName(row)}</span>,
      },
    ]
    if (needsReligion) {
      cols.push({ key: 'religion_id', label: 'Religion ID', getValue: (row) => row.religion_id || '' })
    }
    if (needsCountry) {
      cols.push({
        key: 'country',
        label: 'Country',
        getValue: (row) => row.country_code || row.country_id || '',
      })
    }
    if (needsState) {
      cols.push({
        key: 'state',
        label: 'State',
        getValue: (row) => row.state_code || row.state_id || '',
      })
    }
    cols.push(
      {
        key: 'status',
        label: 'Status',
        getValue: (row) => row.status || 'APPROVED',
        render: (row) => (
          <span className={String(row.status).toUpperCase() === 'APPROVED' ? 'badge-ok' : 'badge-warn'}>
            {row.status || 'APPROVED'}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: false,
        filterable: false,
        export: false,
        render: (row) => {
          const id = itemId(type, row)
          return (
            <div className="flex gap-2">
              <button type="button" className="btn-secondary px-2 py-1 text-xs" onClick={() => startEdit(row)}>
                <Pencil size={14} /> Edit
              </button>
              <button type="button" className="btn-danger px-2 py-1 text-xs" onClick={() => remove(id)}>
                <Trash2 size={14} />
              </button>
            </div>
          )
        },
      },
    )
    return cols
  }, [type, needsReligion, needsCountry, needsState])

  return (
    <div className="space-y-6">
      <form className="card grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4" onSubmit={submit}>
        <div className="sm:col-span-2 lg:col-span-4">
          <p className="page-kicker">Master data</p>
          <h2 className="font-display text-2xl text-ink-900">{editId ? `Edit ${title}` : `Add ${title}`}</h2>
        </div>
        {needsReligion ? (
          <div>
            <label className="label">Religion</label>
            <select className="input" value={religionId} onChange={(e) => setReligionId(e.target.value)} required>
              <option value="">Select religion</option>
              {religions.map((r) => (
                <option key={r.legacy_id} value={r.legacy_id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {needsCountry ? (
          <div>
            <label className="label">Country</label>
            <select
              className="input"
              value={countryId}
              onChange={(e) => {
                setCountryId(e.target.value)
                setStateId('')
              }}
              required
            >
              <option value="">Select country</option>
              {countries.map((c) => (
                <option key={c.legacy_id} value={c.meta?.country_code || c.legacy_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {needsState ? (
          <div>
            <label className="label">State</label>
            <select className="input" value={stateId} onChange={(e) => setStateId(e.target.value)} required>
              <option value="">Select state</option>
              {states.map((s) => (
                <option key={s.legacy_id} value={s.meta?.state_code || s.legacy_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Enter ${title.toLowerCase()}`}
            required
          />
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="APPROVED">APPROVED</option>
            <option value="UNAPPROVED">UNAPPROVED</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary">
            {editId ? (
              <>
                <Pencil size={16} /> Update
              </>
            ) : (
              <>
                <Plus size={16} /> Add
              </>
            )}
          </button>
          {editId ? (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      {msg ? <p className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">{msg}</p> : null}

      <DataTable
        title={title}
        subtitle={`${items.length} records · search, filter, sort & CSV export`}
        columns={columns}
        rows={items}
        loading={loading}
        exportFileName={`master-${type}`}
        searchPlaceholder={`Search ${title.toLowerCase()}…`}
        filters={
          type === 'caste' || type === 'state' || type === 'city'
            ? [
                ...(type === 'caste'
                  ? [
                      {
                        key: 'religion',
                        label: 'All religions',
                        value: religionId,
                        onChange: setReligionId,
                        options: religions.map((r) => ({ value: String(r.legacy_id), label: r.name })),
                      },
                    ]
                  : []),
                ...(type === 'state' || type === 'city'
                  ? [
                      {
                        key: 'country',
                        label: 'All countries',
                        value: countryId,
                        onChange: (v) => {
                          setCountryId(v)
                          setStateId('')
                        },
                        options: countries.map((c) => ({
                          value: String(c.meta?.country_code || c.legacy_id),
                          label: c.name,
                        })),
                      },
                    ]
                  : []),
                ...(type === 'city'
                  ? [
                      {
                        key: 'state',
                        label: 'All states',
                        value: stateId,
                        onChange: setStateId,
                        options: states.map((s) => ({
                          value: String(s.meta?.state_code || s.legacy_id),
                          label: s.name,
                        })),
                      },
                    ]
                  : []),
              ]
            : []
        }
        rowKey={(row) => String(itemId(type, row))}
      />
    </div>
  )
}
