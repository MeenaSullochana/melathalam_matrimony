import { useState } from 'react'
import { Search, Heart } from 'lucide-react'
import { api, photoUrl } from '../lib/api'
import { useAuth } from '../lib/auth'

function oppositeGender(g) {
  const v = String(g || '').toLowerCase()
  if (v.startsWith('m')) return 'Female'
  if (v.startsWith('f')) return 'Male'
  return ''
}

function memberName(m) {
  return [m.firstname, m.lastname].filter(Boolean).join(' ') || m.username || '—'
}

export default function Matchmaking() {
  const { token } = useAuth()
  const [matriId, setMatriId] = useState('')
  const [source, setSource] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function search(e) {
    e.preventDefault()
    const id = matriId.trim()
    if (!id) return
    setLoading(true)
    setError('')
    setSource(null)
    setMatches([])
    try {
      const detail = await api(`/api/admin/members/${encodeURIComponent(id)}`, { token })
      const member = detail.member
      setSource(member)
      const gender = oppositeGender(member.gender)
      const params = new URLSearchParams({ limit: '40', page: '1' })
      if (gender) params.set('gender', gender)
      if (member.part_religion) params.set('q', '')
      // Prefer partner preference fields
      const list = await api(`/api/admin/members?${params}`, { token })
      let rows = (list.members || []).filter((m) => String(m.matri_id).trim() !== String(member.matri_id).trim())
      const prefRel = String(member.part_religion || '').toLowerCase()
      const prefCaste = String(member.part_caste || '').toLowerCase()
      const fromAge = Number(member.part_frm_age) || 0
      const toAge = Number(member.part_to_age) || 99
      rows = rows
        .map((m) => {
          let score = 0
          if (prefRel && String(m.religion || '').toLowerCase().includes(prefRel.split(',')[0])) score += 3
          if (prefCaste && String(m.caste || '').toLowerCase().includes(prefCaste.split(',')[0])) score += 2
          const age = Number(m.age) || 0
          if (age && age >= fromAge && age <= toAge) score += 2
          if (member.part_mtongue && String(m.m_tongue || '').toLowerCase().includes(String(member.part_mtongue).toLowerCase().split(',')[0])) score += 1
          return { ...m, _score: score }
        })
        .sort((a, b) => b._score - a._score)
      setMatches(rows)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink-900">Profile match making</h1>
        <p className="text-sm text-ink-500">Matches ranked by partner preference (religion, caste, age, tongue)</p>
      </div>

      <form className="card flex flex-wrap items-end gap-3 p-5" onSubmit={search}>
        <div className="min-w-[240px] flex-1">
          <label className="label">Member matri ID</label>
          <input className="input" value={matriId} onChange={(e) => setMatriId(e.target.value)} placeholder="e.g. MAT1001" />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          <Search size={16} /> {loading ? 'Searching…' : 'Find matches'}
        </button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {source ? (
        <div className="card flex flex-wrap items-center gap-4 p-5">
          {photoUrl(source.photo1) ? (
            <img src={photoUrl(source.photo1)} alt="" className="h-20 w-20 rounded-xl object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-xl bg-ink-100" />
          )}
          <div>
            <p className="font-semibold text-ink-900">
              {memberName(source)} · {source.matri_id}
            </p>
            <p className="text-sm text-ink-500">
              {source.gender} · {source.religion || '—'} · {source.city || source.country || '—'}
            </p>
          </div>
        </div>
      ) : null}

      {matches.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <div key={m.matri_id} className="card p-4">
              <div className="flex gap-3">
                {photoUrl(m.photo1) ? (
                  <img src={photoUrl(m.photo1)} alt="" className="h-16 w-16 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                    <Heart size={20} />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-ink-900">{memberName(m)}</p>
                  <p className="text-xs text-brand-700">{m.matri_id}</p>
                  <p className="text-xs text-ink-500">
                    {m.age || '—'} · {m.religion || '—'} · {m.city || '—'}
                  </p>
                  <span className="mt-1 inline-block badge-ok">{m.status || 'Active'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : source && !loading ? (
        <p className="text-sm text-ink-500">No matches found with current filters.</p>
      ) : null}
    </div>
  )
}
