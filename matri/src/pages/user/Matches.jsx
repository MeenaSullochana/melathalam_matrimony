import { useEffect, useMemo, useState } from 'react'
import {
  Heart,
  Search,
  ArrowLeft,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react'
import { api, photoUrl, loadSiteDefaults } from '../../api'
import { useAuth } from '../../auth'
import MemberProfileSheet from '../../components/MemberProfileSheet'
import './user-pages.css'

const INITIAL_FILTERS = {
  q: '',
  religion: '',
  caste: '',
  m_status: '',
  age_from: '',
  age_to: '',
  height_from: '',
  height_to: '',
  city: '',
  education: '',
  occupation: '',
  diet: '',
  manglik: '',
  m_tongue: '',
  complexion: '',
  income: '',
  mode: 'all',
}

function hasActiveSearchFilters(f) {
  return Object.entries(f).some(([k, v]) => k !== 'mode' && String(v || '').trim() !== '')
}

function mapMatch(row) {
  const name = row.username || `${row.firstname || ''} ${row.lastname || ''}`.trim() || row.matri_id
  return {
    ...row,
    id: String(row.matri_id || '').trim(),
    name,
    age: row.age || '—',
    city: row.city || '',
    job: row.occupation || row.emp_in || '—',
    education: row.edu_detail || '—',
    height: row.height || '—',
    maritalStatus: row.m_status || '—',
    about: row.profile_text || 'Profile details available after viewing.',
    photo: photoUrl(row.photo1, row.gender),
    featured: row.fstatus === 'Featured',
  }
}

export default function Matches() {
  const { token } = useAuth()
  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [matches, setMatches] = useState([])
  const [total, setTotal] = useState(0)
  const [liked, setLiked] = useState(() => new Set())
  const [selected, setSelected] = useState(null)
  const [fullProfile, setFullProfile] = useState(null)
  const [contactUnlocked, setContactUnlocked] = useState(false)
  const [planInfo, setPlanInfo] = useState(null)
  const [masters, setMasters] = useState({
    religions: [],
    educations: [],
    occupations: [],
    tongues: [],
    heights: [],
    diets: [],
    complexions: [],
  })
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSiteDefaults()
    Promise.all([
      api('/api/public/master/religions').catch(() => ({ items: [] })),
      api('/api/public/master/education').catch(() => ({ items: [] })),
      api('/api/public/master/occupations').catch(() => ({ items: [] })),
      api('/api/public/master/mother-tongues').catch(() => ({ items: [] })),
      api('/api/public/master/heights').catch(() => ({ items: [] })),
      api('/api/public/master/diets').catch(() => ({ items: [] })),
      api('/api/public/master/complexions').catch(() => ({ items: [] })),
      api('/api/member/plan', { token }).catch(() => null),
    ]).then(([r, e, o, t, h, d, c, plan]) => {
      setMasters({
        religions: r.items || [],
        educations: e.items || [],
        occupations: o.items || [],
        tongues: t.items || [],
        heights: h.items || [],
        diets: d.items || [],
        complexions: c.items || [],
      })
      if (plan?.plan) setPlanInfo(plan.plan)
    })
  }, [token])

  async function load(nextFilters = filters) {
    setLoading(true)
    setError('')
    try {
      // When user sets search filters, search all profiles (preference mode would hide results)
      const usePreferred = nextFilters.mode === 'preferred' && !hasActiveSearchFilters(nextFilters)
      const qs = new URLSearchParams({ limit: '48' })
      Object.entries(nextFilters).forEach(([k, v]) => {
        if (!v || k === 'mode') return
        qs.set(k, v)
        // Send numeric inches for height masters that expose meta.value
        if (k === 'height_from' || k === 'height_to') {
          const hit = (masters.heights || []).find((h) => h.name === v)
          if (hit?.value != null && hit.value !== '' && Number.isFinite(Number(hit.value))) {
            qs.set(`${k}_in`, String(hit.value))
          }
        }
      })
      const path = usePreferred
        ? `/api/member/preferred-matches?${qs}`
        : `/api/member/matches?${qs}`
      const data = await api(path, { token })
      setMatches((data.matches || []).map(mapMatch))
      setTotal(data.total || 0)
    } catch (e) {
      setError(e.message)
      setMatches([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const list = useMemo(() => matches, [matches])

  async function openProfile(id) {
    setMsg('')
    setError('')
    try {
      const data = await api(`/api/member/profile/${encodeURIComponent(id)}?full=1`, { token })
      setFullProfile(data.member)
      setContactUnlocked(!!data.contactUnlocked)
      if (data.plan) setPlanInfo(data.plan)
      setSelected(mapMatch(data.member))
    } catch (e) {
      setError(e.message)
    }
  }

  async function unlockContact(id) {
    setMsg('')
    try {
      const res = await api('/api/member/contacts/unlock', {
        method: 'POST',
        token,
        body: { matriId: id },
      })
      setContactUnlocked(true)
      setFullProfile((p) => ({ ...p, ...res.contact }))
      setMsg(res.message || 'Contact unlocked')
      if (res.remaining != null) {
        setPlanInfo((prev) => (prev ? { ...prev, contactsLeft: res.remaining } : prev))
      }
    } catch (e) {
      setMsg(e.message)
    }
  }

  async function sendInterest(id) {
    setMsg('')
    try {
      await api('/api/member/interests', {
        method: 'POST',
        token,
        body: { toMatriId: id, message: 'I am interested in your profile.' },
      })
      setLiked((prev) => new Set(prev).add(id))
      setMsg('Interest sent successfully')
    } catch (e) {
      setMsg(e.message)
    }
  }

  if (selected && fullProfile) {
    return (
      <div className="user-page">
        <div className="user-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, alignItems: 'center' }}>
          <button type="button" className="btn btn-outline" onClick={() => { setSelected(null); setFullProfile(null) }}>
            <ArrowLeft size={16} /> Back to matches
          </button>
          <button type="button" className="btn btn-primary" onClick={() => sendInterest(selected.id)}>
            <Heart size={15} /> {liked.has(selected.id) ? 'Interest sent' : 'Express Interest'}
          </button>
          {!contactUnlocked ? (
            <button type="button" className="btn btn-outline" onClick={() => unlockContact(selected.id)}>
              View contact ({planInfo?.contactsLeft ?? '—'} left)
            </button>
          ) : (
            <span className="user-panel__sub">
              Contact: {fullProfile.email || '—'} / {[fullProfile.mobile_code, fullProfile.mobile].filter(Boolean).join('-')}
            </span>
          )}
          {planInfo ? (
            <span className="user-panel__sub" style={{ marginLeft: 'auto' }}>
              Plan: {planInfo.plan_name || 'Free'} · Profiles left {planInfo.profilesLeft ?? '—'} · Contacts left {planInfo.contactsLeft ?? '—'}
            </span>
          ) : null}
        </div>
        {msg ? <p style={{ marginBottom: 12, color: '#0f766e' }}>{msg}</p> : null}
        {error ? <p style={{ marginBottom: 12, color: '#b42318' }}>{error}</p> : null}
        <MemberProfileSheet member={fullProfile} mode="user" printOnly={false} hideContact={!contactUnlocked} />
      </div>
    )
  }

  return (
    <div className="user-page">
      <section className="user-panel">
        <div className="user-panel__head">
          <div>
            <h2 className="user-panel__title">Search / Matches</h2>
            <p className="user-panel__sub">
              {filters.mode === 'preferred' && !hasActiveSearchFilters(filters)
                ? 'Showing profiles matching your partner preference'
                : 'Browse & filter opposite-gender profiles'}{' '}
              · {total} found
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className={`btn ${filters.mode === 'preferred' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                const next = { ...filters, mode: 'preferred' }
                setFilters(next)
                load(next)
              }}
            >
              Preference matches
            </button>
            <button
              type="button"
              className={`btn ${filters.mode === 'all' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                const next = { ...filters, mode: 'all' }
                setFilters(next)
                load(next)
              }}
            >
              All profiles
            </button>
          </div>
        </div>

        <form
          className="matches-filters"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10, marginBottom: 20 }}
          onSubmit={(e) => {
            e.preventDefault()
            load(filters)
          }}
        >
          <label className="user-field">
            <span><Search size={12} /> Search</span>
            <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="ID or name" />
          </label>
          <label className="user-field">
            <span>Religion</span>
            <select value={filters.religion} onChange={(e) => setFilters({ ...filters, religion: e.target.value })}>
              <option value="">Any</option>
              {masters.religions.map((r) => (
                <option key={r.legacy_id || r.name} value={r.name}>{r.name}</option>
              ))}
            </select>
          </label>
          <label className="user-field">
            <span>Caste</span>
            <input value={filters.caste} onChange={(e) => setFilters({ ...filters, caste: e.target.value })} placeholder="Caste" />
          </label>
          <label className="user-field">
            <span>Marital</span>
            <select value={filters.m_status} onChange={(e) => setFilters({ ...filters, m_status: e.target.value })}>
              <option value="">Any</option>
              <option>Never Married</option>
              <option>Divorced</option>
              <option>Widowed</option>
              <option>Awaiting Divorce</option>
            </select>
          </label>
          <label className="user-field">
            <span>Age from</span>
            <input value={filters.age_from} onChange={(e) => setFilters({ ...filters, age_from: e.target.value })} />
          </label>
          <label className="user-field">
            <span>Age to</span>
            <input value={filters.age_to} onChange={(e) => setFilters({ ...filters, age_to: e.target.value })} />
          </label>
          <label className="user-field">
            <span>City</span>
            <input value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
          </label>
          <label className="user-field">
            <span>Education</span>
            <select value={filters.education} onChange={(e) => setFilters({ ...filters, education: e.target.value })}>
              <option value="">Any</option>
              {masters.educations.map((x) => (
                <option key={x.legacy_id || x.name} value={x.name}>{x.name}</option>
              ))}
            </select>
          </label>
          <label className="user-field">
            <span>Occupation</span>
            <select value={filters.occupation} onChange={(e) => setFilters({ ...filters, occupation: e.target.value })}>
              <option value="">Any</option>
              {masters.occupations.map((x) => (
                <option key={x.legacy_id || x.name} value={x.name}>{x.name}</option>
              ))}
            </select>
          </label>
          <label className="user-field">
            <span>Diet</span>
            <select value={filters.diet} onChange={(e) => setFilters({ ...filters, diet: e.target.value })}>
              <option value="">Any</option>
              {(masters.diets.length ? masters.diets : [{ name: 'Vegetarian' }, { name: 'Non-Vegetarian' }, { name: 'Eggetarian' }]).map((x) => (
                <option key={x.name} value={x.name}>{x.name}</option>
              ))}
            </select>
          </label>
          <label className="user-field">
            <span>Height from</span>
            <select value={filters.height_from} onChange={(e) => setFilters({ ...filters, height_from: e.target.value })}>
              <option value="">Any</option>
              {masters.heights.map((x) => (
                <option key={x.id || x.name} value={x.name}>{x.name}</option>
              ))}
            </select>
          </label>
          <label className="user-field">
            <span>Height to</span>
            <select value={filters.height_to} onChange={(e) => setFilters({ ...filters, height_to: e.target.value })}>
              <option value="">Any</option>
              {masters.heights.map((x) => (
                <option key={`to-${x.id || x.name}`} value={x.name}>{x.name}</option>
              ))}
            </select>
          </label>
          <label className="user-field">
            <span>Mother tongue</span>
            <select value={filters.m_tongue} onChange={(e) => setFilters({ ...filters, m_tongue: e.target.value })}>
              <option value="">Any</option>
              {masters.tongues.map((x) => (
                <option key={x.id || x.name} value={x.name}>{x.name}</option>
              ))}
            </select>
          </label>
          <label className="user-field">
            <span>Complexion</span>
            <select value={filters.complexion} onChange={(e) => setFilters({ ...filters, complexion: e.target.value })}>
              <option value="">Any</option>
              {masters.complexions.map((x) => (
                <option key={x.id || x.name} value={x.name}>{x.name}</option>
              ))}
            </select>
          </label>
          <label className="user-field">
            <span>Income</span>
            <input value={filters.income} onChange={(e) => setFilters({ ...filters, income: e.target.value })} placeholder="Monthly income" />
          </label>
          <label className="user-field">
            <span>Manglik</span>
            <select value={filters.manglik} onChange={(e) => setFilters({ ...filters, manglik: e.target.value })}>
              <option value="">Any</option>
              <option>Yes</option>
              <option>No</option>
              <option>Don't Know</option>
            </select>
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
            <button type="submit" className="btn btn-primary">
              <SlidersHorizontal size={14} /> Apply
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setFilters(INITIAL_FILTERS)
                load(INITIAL_FILTERS)
              }}
            >
              <RotateCcw size={14} /> Reset
            </button>
          </div>
        </form>

        {planInfo ? (
          <p className="user-panel__sub" style={{ marginBottom: 12 }}>
            Your plan: <strong>{planInfo.plan_name || (planInfo.isPaid ? 'Paid' : 'Free')}</strong> · Profile views left:{' '}
            <strong>{planInfo.profilesLeft ?? '—'}</strong> · Contacts left: <strong>{planInfo.contactsLeft ?? '—'}</strong>
          </p>
        ) : null}

        {error ? <p style={{ color: '#b42318' }}>{error}</p> : null}
        {msg ? <p style={{ color: '#0f766e' }}>{msg}</p> : null}
        {loading ? <p className="user-panel__sub">Loading matches…</p> : null}

        <div className="matches-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
          {list.map((m) => (
            <article key={m.id} className="user-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <button type="button" onClick={() => openProfile(m.id)} style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%' }}>
                <img src={m.photo} alt="" style={{ width: '100%', height: 220, objectFit: 'cover' }} />
                <div style={{ padding: 14 }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 6, margin: 0, fontWeight: 600 }}>
                    {m.featured ? <Sparkles size={14} /> : null}
                    {m.name}
                  </p>
                  <p className="user-panel__sub" style={{ margin: '6px 0 0' }}>
                    {m.age} · {m.religion || '—'} · {m.city || m.job}
                  </p>
                </div>
              </button>
              <div style={{ padding: '0 14px 14px', display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => openProfile(m.id)}>
                  View
                </button>
                <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={() => sendInterest(m.id)}>
                  <Heart size={14} fill={liked.has(m.id) ? 'currentColor' : 'none'} />
                  {liked.has(m.id) ? 'Sent' : 'Interest'}
                </button>
              </div>
            </article>
          ))}
        </div>
        {!loading && !list.length ? (
          <p className="user-panel__sub">
            No matches found. Try “All profiles” or update partner preference in your Profile.
          </p>
        ) : null}
      </section>
    </div>
  )
}
