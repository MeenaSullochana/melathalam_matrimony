import { useState } from 'react'
import { Database, Download } from 'lucide-react'
import { API_BASE } from '../lib/api'
import { useAuth } from '../lib/auth'

export default function DatabaseBackup() {
  const { token } = useAuth()
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function download() {
    setBusy(true)
    setMsg('')
    try {
      const res = await fetch(`${API_BASE}/api/admin/database/backup`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `Backup failed (${res.status})`)
      }
      const data = await res.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `matrimony-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setMsg('Backup downloaded successfully.')
    } catch (err) {
      setMsg(err.message || 'Backup route not available yet. Add GET /api/admin/database/backup on the server.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
          <Database size={28} />
        </div>
        <h1 className="font-display text-2xl text-ink-900">Database backup</h1>
        <p className="mt-2 text-sm text-ink-500">Export a JSON snapshot of MongoDB collections</p>
      </div>

      <div className="card space-y-4 p-8 text-center">
        <p className="text-sm text-ink-600">Download may take a moment on large databases. Keep this file secure — it contains member data.</p>
        <button type="button" className="btn-primary mx-auto" onClick={download} disabled={busy}>
          <Download size={16} /> {busy ? 'Preparing…' : 'Download backup'}
        </button>
        {msg ? <p className="text-sm text-ink-700">{msg}</p> : null}
      </div>
    </div>
  )
}
