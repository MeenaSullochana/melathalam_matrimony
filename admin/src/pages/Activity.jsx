import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

const CONFIG = {
  interests: { title: 'Express interest', path: '/api/admin/cms/interests', rowKey: 'ei_id' },
  messages: { title: 'Messages', path: '/api/admin/cms/messages', rowKey: 'mes_id' },
  leads: { title: 'First form leads', path: '/api/admin/cms/first-form', listKey: 'leads', rowKey: 'id' },
}

export default function Activity({ tab = 'interests' }) {
  const { token } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const cfg = useMemo(() => CONFIG[tab] || CONFIG.interests, [tab])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api(cfg.path, { token })
      .then((res) => {
        if (!cancelled) setRows(res.items || res.leads || [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, cfg])

  const columns = rows[0] ? Object.keys(rows[0]).filter((k) => !k.startsWith('_') && k !== '__v').slice(0, 8) : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink-900">{cfg.title}</h1>
        <p className="text-sm text-ink-500">{rows.length} records</p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="card overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {columns.length ? columns.map((c) => <th key={c}>{c}</th>) : <th>Data</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={Math.max(columns.length, 1)} className="py-8 text-center text-ink-500">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={Math.max(columns.length, 1)} className="py-8 text-center text-ink-500">
                    No activity yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row[cfg.rowKey] || JSON.stringify(row)}>
                    {columns.map((c) => (
                      <td key={c} className="max-w-[200px] truncate">
                        {String(row[c] ?? '—')}
                      </td>
                    ))}
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
