import { useCallback, useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

function toCsv(rows, columns) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = columns.join(',')
  const lines = rows.map((r) => columns.map((c) => esc(r[c])).join(','))
  return [header, ...lines].join('\n')
}

export default function Reports({ kind = 'members' }) {
  const { token } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    if (kind === 'sales') {
      api(`/api/admin/plans/payments/list?page=${page}`, { token })
        .then((res) => {
          setRows(res.payments || [])
          setTotal(res.total || 0)
        })
        .finally(() => setLoading(false))
      return
    }
    const params = new URLSearchParams({ page: '1', limit: '100' })
    if (status) params.set('status', status)
    if (q) params.set('q', q)
    api(`/api/admin/members?${params}`, { token })
      .then((res) => {
        setRows(res.members || [])
        setTotal(res.total || 0)
      })
      .finally(() => setLoading(false))
  }, [token, kind, page, status, q])

  useEffect(() => {
    load()
  }, [load])

  function exportCsv() {
    if (!rows.length) return
    const cols = Object.keys(rows[0]).filter((k) => !['_id', '__v'].includes(k)).slice(0, 12)
    const blob = new Blob([toCsv(rows, cols)], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = kind === 'sales' ? 'sales-report.csv' : 'members-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const columns = rows[0] ? Object.keys(rows[0]).filter((k) => !['_id', '__v'].includes(k)).slice(0, 10) : []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-ink-900">
            {kind === 'sales'
              ? 'Sales report'
              : kind === 'export'
                ? 'Export members to Excel'
                : kind === 'custom'
                  ? 'Export custom Excel'
                  : 'Filter member download'}
          </h1>
          <p className="text-sm text-ink-500">{total} records</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {kind === 'members' ? (
            <>
              <select className="input w-36" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All status</option>
                <option value="Active">Active</option>
                <option value="Paid">Paid</option>
              </select>
              <input className="input w-48" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
              <button type="button" className="btn-secondary" onClick={load}>
                Filter
              </button>
            </>
          ) : null}
          <button type="button" className="btn-primary" onClick={exportCsv}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={Math.max(columns.length, 1)} className="py-8 text-center">
                    Loading…
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={row.matri_id || row.payid || i}>
                    {columns.map((c) => (
                      <td key={c} className="max-w-[180px] truncate">
                        {String(row[c] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {kind === 'sales' && total > 30 ? (
          <div className="flex justify-center gap-2 border-t border-ink-100 p-3">
            <button type="button" className="btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Prev
            </button>
            <span className="text-sm text-ink-500">Page {page}</span>
            <button type="button" className="btn-secondary" onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
