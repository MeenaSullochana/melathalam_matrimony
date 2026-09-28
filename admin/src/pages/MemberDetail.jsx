import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Printer, Save, Upload, User, Users, Heart, Star, FileText, ShieldCheck } from 'lucide-react'
import { api, horoUrl, photoUrl, docUrl } from '../lib/api'
import { useAuth } from '../lib/auth'
import MemberProfileSheet from '../components/MemberProfileSheet'
import MediaPreview from '../components/MediaPreview'
import HoroscopeChartsEditor, { emptyHoroscopeHouses } from '../components/HoroscopeChartsEditor'
import { PARTNER_FIELDS } from '../lib/memberFields'

/** Same groups as member Profile page (no separate Additional / member-details tab) */
const TABS = [
  { id: 'biodata', label: 'Biodata', icon: User },
  { id: 'family', label: 'Family Details', icon: Users },
  { id: 'partner', label: 'Partner Expectations', icon: Heart },
  { id: 'horoscope', label: 'Horoscope', icon: Star },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'approvals', label: 'Approvals', icon: ShieldCheck },
]

/** Convert DB dates (1/29/1999, 29-01-1999, ISO…) → yyyy-mm-dd for <input type="date"> */
export function toDateInputValue(raw) {
  if (raw == null || raw === '') return ''
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    return raw.toISOString().slice(0, 10)
  }
  const s = String(raw).trim()
  if (!s) return ''
  // Already yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  // ISO datetime
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10)
  // M/D/YYYY or MM/DD/YYYY
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) {
    const [, a, b, y] = m
    // Prefer US M/D/Y (matches PHP migration data like 1/29/1999)
    const month = Number(a)
    const day = Number(b)
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }
  // D-M-YYYY or DD-MM-YYYY
  m = s.match(/^(\d{1,2})[-.](\d{1,2})[-.](\d{4})$/)
  if (m) {
    const day = Number(m[1])
    const month = Number(m[2])
    const y = m[3]
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }
  const parsed = new Date(s)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  return ''
}

function ageFromDob(yyyyMmDd) {
  if (!yyyyMmDd) return ''
  const d = new Date(yyyyMmDd)
  if (Number.isNaN(d.getTime())) return ''
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
  return String(age)
}

const emptyForm = () => ({
  firstname: '',
  lastname: '',
  profileby: 'Self',
  mobile_code: '+91',
  mobile: '',
  email: '',
  password: '',
  gender: 'Male',
  birthdate: '',
  age: '',
  m_status: 'Never Married',
  m_tongue: '',
  tot_children: '0',
  status_children: '',
  religion: '',
  caste: '',
  subcaste: '',
  gothra: '',
  will_to_mary_caste: '',
  edu_detail: '',
  occupation: '',
  emp_in: '',
  income: '',
  family_type: '',
  family_value: '',
  family_status: '',
  family_origin: '',
  father_name: '',
  mother_name: '',
  father_occupation: '',
  mother_occupation: '',
  no_of_brothers: '',
  no_of_sisters: '',
  no_marri_brother: '',
  no_marri_sister: '',
  address: '',
  land_property: '',
  country_id: '',
  state_id: '',
  city: '',
  diet: '',
  smoke: '',
  drink: '',
  language_known: '',
  hobby: '',
  height: '',
  weight: '',
  physicalStatus: '',
  bodytype: '',
  complexion: '',
  manglik: '',
  star: '',
  moonsign: '',
  birthplace: '',
  birthtime: '',
  birth_time_type: '',
  padham: '',
  lagnam: '',
  profile_text: '',
  looking_for: '',
  part_frm_age: '',
  part_to_age: '',
  part_height: '',
  part_height_to: '',
  part_physical: '',
  part_diet: '',
  part_smoke: '',
  part_drink: '',
  part_religion: '',
  part_caste: '',
  part_subcaste: '',
  part_mtongue: '',
  part_manglik: '',
  part_star: '',
  part_rasi: '',
  part_complexation: '',
  part_country_living: '',
  part_state: '',
  part_city: '',
  part_edu: '',
  part_occu: '',
  part_emp_in: '',
  part_income: '',
  part_resi_status: '',
  part_expect: '',
  part_dosh: '',
  status: 'Active',
  fstatus: '',
  plan_id: '',
  plan_name: '',
  plan_expired_on: '',
  matri_id: '',
  aadhaar_card: '',
  aadhaar_card_status: '',
  hor_photo: '',
  hor_check: '',
  photo1: '',
  photo2: '',
  photo3: '',
  photo4: '',
  photo5: '',
  photo6: '',
  ...emptyHoroscopeHouses(),
})

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function Select({ value, onChange, options, placeholder = 'Select', disabled }) {
  return (
    <select className="input" disabled={disabled} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function SectionTitle({ children }) {
  return <h2 className="sm:col-span-2 lg:col-span-3 border-b border-ink-100 pb-2 font-display text-lg text-ink-900">{children}</h2>
}

export default function MemberDetail({ matriId, mode = 'edit', onBack }) {
  const { token } = useAuth()
  const isNew = mode === 'add' || matriId === 'new'
  const isView = mode === 'view'
  const isPrint = mode === 'print'
  const locked = isView || isPrint
  const [tab, setTab] = useState('biodata')
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [masters, setMasters] = useState({
    religions: [],
    castes: [],
    subcastes: [],
    countries: [],
    states: [],
    cities: [],
    occupations: [],
    educations: [],
    tongues: [],
    heights: [],
    weights: [],
    diets: [],
    complexions: [],
    bodyTypes: [],
  })
  const [photoFiles, setPhotoFiles] = useState({})
  const [horoFile, setHoroFile] = useState(null)
  const [approvalItems, setApprovalItems] = useState([])
  const [approvalChecked, setApprovalChecked] = useState({})
  const [approvalMsg, setApprovalMsg] = useState('')

  const id = useMemo(() => decodeURIComponent(String(matriId || '')).trim(), [matriId])
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const loadApprovals = useCallback(async () => {
    if (isNew || !id) return
    try {
      const res = await api(`/api/admin/approvals/member/${encodeURIComponent(id)}`, { token })
      setApprovalItems(res.items || [])
      const init = {}
      ;(res.items || []).forEach((it) => {
        if (it.status === 'PENDING') init[it.key] = true
      })
      setApprovalChecked(init)
    } catch {
      setApprovalItems([])
    }
  }, [id, token, isNew])

  useEffect(() => {
    if (tab === 'approvals') loadApprovals()
  }, [tab, loadApprovals])

  async function approvalAct(action, keys) {
    setApprovalMsg('')
    try {
      const res = await api(`/api/admin/approvals/member/${encodeURIComponent(id)}`, {
        method: 'POST',
        token,
        body: keys ? { action, keys } : { action },
      })
      setApprovalMsg(res.message || 'Updated')
      await loadApprovals()
      // refresh member form flags
      const mem = await api(`/api/admin/members/${encodeURIComponent(id)}`, { token })
      setForm(normalizeMember(mem.member || {}))
    } catch (err) {
      setApprovalMsg(err.message)
    }
  }

  function normalizeMember(member) {
    const next = { ...emptyForm(), ...member }
    const dob =
      toDateInputValue(member.birthdate) ||
      toDateInputValue(member.birth_date) ||
      toDateInputValue(member.dob) ||
      ''
    next.birthdate = dob
    if (!next.age && dob) next.age = ageFromDob(dob)
    return next
  }

  const loadMasters = useCallback(async () => {
    try {
      const [
        religions,
        countries,
        occupations,
        educations,
        tongues,
        subcastes,
        heights,
        weights,
        diets,
        complexions,
        bodyTypes,
      ] = await Promise.all([
        api('/api/admin/master/religion', { token }),
        api('/api/admin/master/country', { token }),
        api('/api/admin/master/occupation', { token }),
        api('/api/admin/master/education', { token }),
        api('/api/admin/master/mother-tongue', { token }),
        api('/api/admin/master/sub-caste', { token }),
        api('/api/admin/master/height', { token }),
        api('/api/admin/master/weight', { token }),
        api('/api/admin/master/diet', { token }),
        api('/api/admin/master/complexion', { token }),
        api('/api/admin/master/body-type', { token }),
      ])
      setMasters((m) => ({
        ...m,
        religions: religions.items || [],
        countries: countries.items || [],
        occupations: occupations.items || [],
        educations: educations.items || [],
        tongues: tongues.items || [],
        subcastes: subcastes.items || [],
        heights: heights.items || [],
        weights: weights.items || [],
        diets: diets.items || [],
        complexions: complexions.items || [],
        bodyTypes: bodyTypes.items || [],
      }))
    } catch {
      /* ignore */
    }
  }, [token])

  useEffect(() => {
    loadMasters()
  }, [loadMasters])

  useEffect(() => {
    if (!form.religion) {
      setMasters((m) => ({ ...m, castes: [] }))
      return
    }
    api(`/api/admin/master/caste?religion_id=${encodeURIComponent(form.religion)}`, { token })
      .then((r) => setMasters((m) => ({ ...m, castes: r.items || [] })))
      .catch(() => setMasters((m) => ({ ...m, castes: [] })))
  }, [form.religion, token])

  useEffect(() => {
    if (!form.country_id) {
      setMasters((m) => ({ ...m, states: [] }))
      return
    }
    api(`/api/admin/master/state?country_id=${encodeURIComponent(form.country_id)}`, { token })
      .then((r) => setMasters((m) => ({ ...m, states: r.items || [] })))
      .catch(() => setMasters((m) => ({ ...m, states: [] })))
  }, [form.country_id, token])

  useEffect(() => {
    if (!form.state_id) {
      setMasters((m) => ({ ...m, cities: [] }))
      return
    }
    api(`/api/admin/master/city?state_id=${encodeURIComponent(form.state_id)}`, { token })
      .then((r) => setMasters((m) => ({ ...m, cities: r.items || [] })))
      .catch(() => setMasters((m) => ({ ...m, cities: [] })))
  }, [form.state_id, token])

  useEffect(() => {
    if (isNew) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    api(`/api/admin/members/${encodeURIComponent(id)}`, { token })
      .then((res) => {
        if (!cancelled) setForm(normalizeMember(res.member || {}))
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
  }, [id, token, isNew])

  useEffect(() => {
    if (isPrint && !loading && form.matri_id) {
      const t = setTimeout(() => window.print(), 400)
      return () => clearTimeout(t)
    }
  }, [isPrint, loading, form.matri_id])

  async function save(e) {
    e?.preventDefault?.()
    if (isView) return
    setSaving(true)
    setMsg('')
    setError('')
    try {
      const body = { ...form }
      delete body._id
      delete body.__v
      delete body.createdAt
      delete body.updatedAt
      if (!body.password) delete body.password
      // Persist DOB as yyyy-mm-dd
      if (body.birthdate) {
        body.birthdate = toDateInputValue(body.birthdate) || body.birthdate
        body.age = ageFromDob(body.birthdate) || body.age
      }
      let res
      if (isNew) {
        res = await api('/api/admin/members', { method: 'POST', token, body })
        setMsg(`Created ${res.member?.matri_id}`)
        setForm(normalizeMember(res.member || {}))
        if (res.member?.matri_id) {
          window.location.hash = `#/members/${encodeURIComponent(String(res.member.matri_id).trim())}`
        }
      } else {
        res = await api(`/api/admin/members/${encodeURIComponent(id)}`, {
          method: 'PUT',
          token,
          body,
        })
        setForm(normalizeMember(res.member || body))
        setMsg(res.message || 'Saved')
      }
      const targetId = String(res.member?.matri_id || id).trim()
      if (Object.keys(photoFiles).length) {
        const fd = new FormData()
        Object.entries(photoFiles).forEach(([k, file]) => file && fd.append(k, file))
        const up = await api(`/api/admin/members/${encodeURIComponent(targetId)}/photos`, {
          method: 'POST',
          token,
          formData: fd,
        })
        setForm(normalizeMember(up.member || {}))
        setPhotoFiles({})
      }
      if (horoFile) {
        const fd = new FormData()
        fd.append('hor_photo', horoFile)
        const up = await api(`/api/admin/members/${encodeURIComponent(targetId)}/horoscope-photo`, {
          method: 'POST',
          token,
          formData: fd,
        })
        setForm(normalizeMember(up.member || {}))
        setHoroFile(null)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const opt = (list) =>
    list.map((i) => ({
      value: String(i.name ?? i.legacy_id),
      label: i.name,
    }))

  if (loading) return <p className="text-sm text-ink-500">Loading member…</p>
  if (error && !form.matri_id && !isNew) {
    return (
      <div className="space-y-4">
        <button type="button" className="btn-secondary" onClick={() => onBack?.()}>
          <ArrowLeft size={16} /> Back
        </button>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  const title = isNew ? 'Add member' : isPrint ? 'Print profile' : isView ? 'View member' : 'Edit member'
  const fullName = [form.firstname, form.lastname].filter(Boolean).join(' ') || 'New profile'
  const mid = String(form.matri_id || id).trim()

  /* PHP-style combined single profile for view + print */
  if ((isView || isPrint) && form.matri_id) {
    return (
      <div className={`print-area ${isPrint ? '' : 'space-y-4'}`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 print:hidden no-print">
          <div className="flex items-center gap-3">
            <button type="button" className="btn-secondary" onClick={() => onBack?.()}>
              <ArrowLeft size={16} /> Back
            </button>
            <div>
              <h1 className="font-display text-2xl text-ink-900">
                {title} · {form.matri_id}
              </h1>
              <p className="text-sm text-ink-500">{fullName}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                window.location.hash = `#/members/${encodeURIComponent(mid)}`
              }}
            >
              Edit Profile
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                if (isPrint) window.print()
                else window.location.hash = `#/members/${encodeURIComponent(mid)}/print`
              }}
            >
              <Printer size={16} /> Print / PDF
            </button>
          </div>
        </div>
        <MemberProfileSheet
          member={form}
          mode="admin"
          printOnly={isPrint}
          onEdit={() => {
            window.location.hash = `#/members/${encodeURIComponent(mid)}`
          }}
          onPrint={() => {
            window.location.hash = `#/members/${encodeURIComponent(mid)}/print`
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button type="button" className="btn-secondary" onClick={() => onBack?.()}>
            <ArrowLeft size={16} /> Back
          </button>
          <div>
            <h1 className="font-display text-2xl text-ink-900">
              {title} {form.matri_id ? `· ${form.matri_id}` : ''}
            </h1>
            <p className="text-sm text-ink-500">{fullName}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && form.matri_id ? (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  window.location.hash = `#/members/${encodeURIComponent(mid)}/view`
                }}
              >
                View profile
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  window.location.hash = `#/members/${encodeURIComponent(mid)}/history`
                }}
              >
                History
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  window.location.hash = `#/members/${encodeURIComponent(mid)}/print`
                }}
              >
                <Printer size={16} /> Print
              </button>
            </>
          ) : null}
          {!locked ? (
            <button type="button" className="btn-primary" disabled={saving} onClick={save}>
              <Save size={16} /> {saving ? 'Saving…' : isNew ? 'Create member' : 'Save all'}
            </button>
          ) : null}
        </div>
      </div>

      {msg ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 print:hidden">{msg}</p> : null}
      {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 print:hidden">{error}</p> : null}

      {!isPrint ? (
        <div className="flex flex-wrap gap-1 print:hidden">
          {TABS.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  tab === t.id ? 'bg-brand-700 text-white' : 'bg-white text-ink-600 hover:bg-ink-100'
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            )
          })}
        </div>
      ) : null}

      <form
        className="card space-y-8 p-6"
        onSubmit={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault()
        }}
      >
        {/* BIODATA — combines basic + religion + education + location + physical + habits + about */}
        {tab === 'biodata' && (
          <div className="space-y-8">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SectionTitle>Biodata</SectionTitle>
              <Field label="Profile ID">
                <input className="input bg-ink-100" value={form.matri_id || (isNew ? '(auto)' : '')} readOnly={!isNew} onChange={(e) => set('matri_id', e.target.value.trim())} />
              </Field>
              <Field label="Profile created by">
                <Select disabled={locked} value={form.profileby} onChange={(v) => set('profileby', v)} options={['Self', 'Parents', 'Sibling', 'Relative', 'Friend'].map((x) => ({ value: x, label: x }))} />
              </Field>
              <Field label="Full name">
                <input
                  className="input"
                  disabled={locked}
                  value={fullName === 'New profile' ? '' : fullName}
                  onChange={(e) => {
                    const parts = e.target.value.trim().split(/\s+/)
                    set('firstname', parts[0] || '')
                    set('lastname', parts.slice(1).join(' '))
                  }}
                />
              </Field>
              <Field label="First name">
                <input className="input" disabled={locked} value={form.firstname || ''} onChange={(e) => set('firstname', e.target.value)} />
              </Field>
              <Field label="Last name">
                <input className="input" disabled={locked} value={form.lastname || ''} onChange={(e) => set('lastname', e.target.value)} />
              </Field>
              <Field label="Gender">
                <Select disabled={locked} value={form.gender} onChange={(v) => set('gender', v)} options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]} />
              </Field>
              <Field label="Date of birth">
                <input
                  type="date"
                  className="input"
                  disabled={locked}
                  value={toDateInputValue(form.birthdate)}
                  onChange={(e) => {
                    const v = e.target.value
                    setForm((prev) => ({ ...prev, birthdate: v, age: ageFromDob(v) || prev.age }))
                  }}
                />
              </Field>
              <Field label="Age">
                <input className="input" disabled={locked} value={form.age || ''} onChange={(e) => set('age', e.target.value)} />
              </Field>
              <Field label="Place of birth">
                <input className="input" disabled={locked} value={form.birthplace || ''} onChange={(e) => set('birthplace', e.target.value)} />
              </Field>
              <Field label="Time of birth">
                <input className="input" disabled={locked} value={form.birthtime || ''} onChange={(e) => set('birthtime', e.target.value)} />
              </Field>
              <Field label="Height">
                <Select disabled={locked} value={form.height} onChange={(v) => set('height', v)} options={opt(masters.heights)} placeholder="Select height" />
              </Field>
              <Field label="Weight">
                <Select disabled={locked} value={form.weight} onChange={(v) => set('weight', v)} options={opt(masters.weights)} placeholder="Select weight" />
              </Field>
              <Field label="Marital status">
                <Select disabled={locked} value={form.m_status} onChange={(v) => set('m_status', v)} options={['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'].map((x) => ({ value: x, label: x }))} />
              </Field>
              <Field label="Mother tongue">
                <Select disabled={locked} value={form.m_tongue} onChange={(v) => set('m_tongue', v)} options={opt(masters.tongues)} />
              </Field>
              <Field label="Mobile code">
                <input className="input" disabled={locked} value={form.mobile_code || ''} onChange={(e) => set('mobile_code', e.target.value)} />
              </Field>
              <Field label="Mobile">
                <input className="input" disabled={locked} value={form.mobile || ''} onChange={(e) => set('mobile', e.target.value)} />
              </Field>
              <Field label="Email">
                <input className="input" disabled={locked} value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
              </Field>
              {!locked ? (
                <Field label={isNew ? 'Password' : 'New password (optional)'}>
                  <input type="password" className="input" value={form.password || ''} onChange={(e) => set('password', e.target.value)} />
                </Field>
              ) : null}
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SectionTitle>Religion & caste</SectionTitle>
              <Field label="Religion">
                <Select
                  disabled={locked}
                  value={form.religion}
                  onChange={(v) => {
                    set('religion', v)
                    set('caste', '')
                  }}
                  options={opt(masters.religions)}
                />
              </Field>
              <Field label="Caste">
                <Select disabled={locked} value={form.caste} onChange={(v) => set('caste', v)} options={opt(masters.castes)} placeholder="Select caste" />
              </Field>
              <Field label="Sub caste">
                <Select disabled={locked} value={form.subcaste} onChange={(v) => set('subcaste', v)} options={opt(masters.subcastes)} />
              </Field>
              <Field label="Gothram">
                <input className="input" disabled={locked} value={form.gothra || ''} onChange={(e) => set('gothra', e.target.value)} />
              </Field>
              <Field label="Willing to marry from">
                <input className="input" disabled={locked} value={form.will_to_mary_caste || ''} onChange={(e) => set('will_to_mary_caste', e.target.value)} />
              </Field>
              <Field label="Manglik">
                <Select disabled={locked} value={form.manglik} onChange={(v) => set('manglik', v)} options={['Yes', 'No', "Don't Know"].map((x) => ({ value: x, label: x }))} />
              </Field>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SectionTitle>Education & occupation</SectionTitle>
              <Field label="Education">
                <Select disabled={locked} value={form.edu_detail} onChange={(v) => set('edu_detail', v)} options={opt(masters.educations)} />
              </Field>
              <Field label="Occupation">
                <Select disabled={locked} value={form.occupation} onChange={(v) => set('occupation', v)} options={opt(masters.occupations)} />
              </Field>
              <Field label="Employed in">
                <input className="input" disabled={locked} value={form.emp_in || ''} onChange={(e) => set('emp_in', e.target.value)} />
              </Field>
              <Field label="Annual income">
                <input className="input" disabled={locked} value={form.income || ''} onChange={(e) => set('income', e.target.value)} />
              </Field>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SectionTitle>Location & lifestyle</SectionTitle>
              <Field label="Country">
                <Select
                  disabled={locked}
                  value={form.country_id}
                  onChange={(v) => {
                    set('country_id', v)
                    set('state_id', '')
                    set('city', '')
                  }}
                  options={masters.countries.map((c) => ({
                    value: String(c.meta?.country_code || c.legacy_id || c.name),
                    label: c.name,
                  }))}
                />
              </Field>
              <Field label="State">
                <Select
                  disabled={locked}
                  value={form.state_id}
                  onChange={(v) => {
                    set('state_id', v)
                    set('city', '')
                  }}
                  options={masters.states.map((s) => ({
                    value: String(s.meta?.state_code || s.legacy_id || s.name),
                    label: s.name,
                  }))}
                />
              </Field>
              <Field label="City">
                <Select disabled={locked} value={form.city} onChange={(v) => set('city', v)} options={opt(masters.cities)} />
              </Field>
              <Field label="Diet">
                <Select disabled={locked} value={form.diet} onChange={(v) => set('diet', v)} options={opt(masters.diets)} />
              </Field>
              <Field label="Smoke">
                <Select
                  disabled={locked}
                  value={form.smoke}
                  onChange={(v) => set('smoke', v)}
                  options={['No', 'Occasionally', 'Yes'].map((x) => ({ value: x, label: x }))}
                />
              </Field>
              <Field label="Drink">
                <Select
                  disabled={locked}
                  value={form.drink}
                  onChange={(v) => set('drink', v)}
                  options={['No', 'Occasionally', 'Yes'].map((x) => ({ value: x, label: x }))}
                />
              </Field>
              <Field label="Complexion">
                <Select disabled={locked} value={form.complexion} onChange={(v) => set('complexion', v)} options={opt(masters.complexions)} />
              </Field>
              <Field label="Body type">
                <Select disabled={locked} value={form.bodytype} onChange={(v) => set('bodytype', v)} options={opt(masters.bodyTypes)} />
              </Field>
              <Field label="Physical status">
                <Select
                  disabled={locked}
                  value={form.physicalStatus}
                  onChange={(v) => set('physicalStatus', v)}
                  options={['Normal', 'Physically Challenged'].map((x) => ({ value: x, label: x }))}
                />
              </Field>
              <Field label="Status">
                <Select disabled={locked} value={form.status} onChange={(v) => set('status', v)} options={['Active', 'Paid', 'Inactive', 'Suspended'].map((x) => ({ value: x, label: x }))} />
              </Field>
              <Field label="Featured">
                <Select
                  disabled={locked}
                  value={form.fstatus || ''}
                  onChange={(v) => set('fstatus', v)}
                  options={[
                    { value: '', label: 'Normal' },
                    { value: 'Featured', label: 'Featured' },
                  ]}
                />
              </Field>
              <Field label="Hobby">
                <input className="input" disabled={locked} value={form.hobby || ''} onChange={(e) => set('hobby', e.target.value)} />
              </Field>
              <Field label="About me" className="sm:col-span-2 lg:col-span-3">
                <textarea className="input min-h-[100px]" disabled={locked} value={form.profile_text || ''} onChange={(e) => set('profile_text', e.target.value)} />
              </Field>
            </section>
          </div>
        )}

        {tab === 'family' && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SectionTitle>Family details</SectionTitle>
            {[
              ['family_type', 'Family type'],
              ['family_value', 'Family value'],
              ['family_status', 'Family status'],
              ['family_origin', 'Native / family origin'],
              ['father_name', "Father's name"],
              ['father_occupation', "Father's occupation"],
              ['mother_name', "Mother's name"],
              ['mother_occupation', "Mother's occupation"],
              ['no_of_brothers', 'No. of brothers'],
              ['no_marri_brother', 'Married brothers'],
              ['no_of_sisters', 'No. of sisters'],
              ['no_marri_sister', 'Married sisters'],
              ['land_property', 'Land / property'],
            ].map(([k, label]) => (
              <Field key={k} label={label}>
                <input className="input" disabled={locked} value={form[k] || ''} onChange={(e) => set(k, e.target.value)} />
              </Field>
            ))}
            <Field label="Address" className="sm:col-span-2 lg:col-span-3">
              <textarea className="input min-h-[80px]" disabled={locked} value={form.address || ''} onChange={(e) => set('address', e.target.value)} />
            </Field>
          </section>
        )}

        {tab === 'partner' && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SectionTitle>Partner expectations (PHP parity)</SectionTitle>
            {PARTNER_FIELDS.map(([k, label]) => {
              if (k === 'part_height' || k === 'part_height_to') {
                return (
                  <Field key={k} label={label}>
                    <Select disabled={locked} value={form[k]} onChange={(v) => set(k, v)} options={opt(masters.heights)} />
                  </Field>
                )
              }
              if (k === 'part_diet') {
                return (
                  <Field key={k} label={label}>
                    <Select disabled={locked} value={form[k]} onChange={(v) => set(k, v)} options={opt(masters.diets)} />
                  </Field>
                )
              }
              if (k === 'part_edu') {
                return (
                  <Field key={k} label={label}>
                    <Select disabled={locked} value={form[k]} onChange={(v) => set(k, v)} options={opt(masters.educations)} />
                  </Field>
                )
              }
              if (k === 'part_occu') {
                return (
                  <Field key={k} label={label}>
                    <Select disabled={locked} value={form[k]} onChange={(v) => set(k, v)} options={opt(masters.occupations)} />
                  </Field>
                )
              }
              if (k === 'part_complexation') {
                return (
                  <Field key={k} label={label}>
                    <Select disabled={locked} value={form[k]} onChange={(v) => set(k, v)} options={opt(masters.complexions)} />
                  </Field>
                )
              }
              return (
                <Field key={k} label={label}>
                  <input className="input" disabled={locked} value={form[k] || ''} onChange={(e) => set(k, e.target.value)} />
                </Field>
              )
            })}
            <Field label="Any other expectation" className="sm:col-span-2 lg:col-span-3">
              <textarea className="input min-h-[100px]" disabled={locked} value={form.part_expect || ''} onChange={(e) => set('part_expect', e.target.value)} />
            </Field>
          </section>
        )}

        {tab === 'horoscope' && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SectionTitle>Horoscope</SectionTitle>
            {[
              ['star', 'Star / Nakshatra'],
              ['moonsign', 'Rasi / moonsign'],
              ['lagnam', 'Lagnam'],
              ['padham', 'Pada'],
              ['manglik', 'Manglik / Chevvai dosham'],
              ['birthplace', 'Place of birth'],
              ['birthtime', 'Time of birth'],
              ['birth_time_type', 'AM / PM'],
            ].map(([k, label]) => (
              <Field key={k} label={label}>
                <input className="input" disabled={locked} value={form[k] || ''} onChange={(e) => set(k, e.target.value)} />
              </Field>
            ))}
            <Field label="Horoscope image" className="sm:col-span-2 lg:col-span-3">
              <div className="flex flex-wrap items-start gap-4">
                <div>
                  <p className="mb-1 text-xs font-semibold text-ink-600">Horoscope</p>
                  <MediaPreview
                    src={form.hor_photo ? horoUrl(form.hor_photo) : null}
                    className="h-40 w-40"
                    fit="contain"
                    placeholder="No horoscope"
                  />
                </div>
                {!locked ? (
                  <label className="btn-secondary mt-6 cursor-pointer">
                    <Upload size={16} /> Upload horoscope
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setHoroFile(e.target.files?.[0] || null)} />
                  </label>
                ) : null}
                {horoFile ? <span className="mt-6 text-xs text-ink-500">{horoFile.name}</span> : null}
              </div>
            </Field>
            <div className="sm:col-span-2 lg:col-span-3">
              <SectionTitle>RASI & AMSAM charts</SectionTitle>
              <HoroscopeChartsEditor
                values={form}
                disabled={locked}
                onChange={(key, val) => set(key, val)}
              />
            </div>
          </section>
        )}

        {tab === 'documents' && (
          <section className="space-y-4">
            <SectionTitle>Documents & photos</SectionTitle>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((n) => {
                const key = `photo${n}`
                const fileName = form[key]
                const hasPhoto = fileName && fileName !== 'default.png'
                return (
                  <div key={key} className="rounded-xl border border-ink-100 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase text-ink-500">Photo {n}</p>
                    <MediaPreview
                      src={hasPhoto ? photoUrl(fileName, form.gender) : null}
                      className="mb-2 h-36 w-full"
                      fit="cover"
                      placeholder="No photo"
                    />
                    {!locked ? (
                      <input
                        type="file"
                        accept="image/*"
                        className="text-xs"
                        onChange={(e) => setPhotoFiles((p) => ({ ...p, [key]: e.target.files?.[0] }))}
                      />
                    ) : null}
                    {hasPhoto ? <p className="mt-1 truncate text-[11px] text-ink-400">{fileName}</p> : null}
                  </div>
                )
              })}
            </div>
            <div className="rounded-xl border border-ink-100 p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-ink-500">Aadhaar / ID proof</p>
              <div className="flex flex-wrap items-start gap-4">
                <MediaPreview
                  src={
                    form.aadhaar_card && /\.(jpe?g|png|webp)$/i.test(form.aadhaar_card)
                      ? docUrl(form.aadhaar_card)
                      : null
                  }
                  className="h-36 w-40"
                  fit="contain"
                  placeholder="No document image"
                />
                <div className="min-w-[200px] flex-1">
                  <input
                    className="input"
                    disabled={locked}
                    value={form.aadhaar_card || ''}
                    onChange={(e) => set('aadhaar_card', e.target.value)}
                    placeholder="Filename or reference"
                  />
                  {form.aadhaar_card_status ? (
                    <p className="mt-1 text-xs text-ink-500">Status: {form.aadhaar_card_status}</p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === 'approvals' && !isNew && (
          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SectionTitle>Member approvals</SectionTitle>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-primary" onClick={() => approvalAct('approve-all')}>
                  <ShieldCheck size={14} /> Approve all
                </button>
                <button
                  type="button"
                  className="btn-ok"
                  disabled={!Object.values(approvalChecked).some(Boolean)}
                  onClick={() =>
                    approvalAct(
                      'approve',
                      Object.entries(approvalChecked)
                        .filter(([, v]) => v)
                        .map(([k]) => k),
                    )
                  }
                >
                  Approve checked
                </button>
                <button
                  type="button"
                  className="btn-danger"
                  disabled={!Object.values(approvalChecked).some(Boolean)}
                  onClick={() =>
                    approvalAct(
                      'reject',
                      Object.entries(approvalChecked)
                        .filter(([, v]) => v)
                        .map(([k]) => k),
                    )
                  }
                >
                  Reject checked
                </button>
              </div>
            </div>
            {approvalMsg ? <p className="text-sm text-emerald-700">{approvalMsg}</p> : null}
            <div className="space-y-3">
              {approvalItems.map((it) => (
                <label
                  key={it.key}
                  className={`flex cursor-pointer gap-4 rounded-xl border p-3 ${
                    it.status === 'PENDING' ? 'border-amber-200 bg-amber-50/50' : 'border-ink-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={!!approvalChecked[it.key]}
                    disabled={it.status !== 'PENDING'}
                    onChange={(e) => setApprovalChecked((c) => ({ ...c, [it.key]: e.target.checked }))}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold">{it.label}</span>
                      <span className={it.status === 'APPROVED' ? 'badge-ok' : 'badge-warn'}>{it.status}</span>
                    </div>
                    {it.type === 'image' ? (
                      <MediaPreview
                        src={
                          it.value
                            ? it.imageKind === 'horo'
                              ? horoUrl(it.value)
                              : it.imageKind === 'doc'
                                ? docUrl(it.value)
                                : photoUrl(it.value, form.gender)
                            : null
                        }
                        className="h-32 w-40"
                        fit={it.imageKind === 'horo' || it.imageKind === 'doc' ? 'contain' : 'cover'}
                        placeholder="No image"
                      />
                    ) : (
                      <p className="whitespace-pre-wrap text-sm text-ink-700">{it.value}</p>
                    )}
                    {it.status === 'PENDING' ? (
                      <div className="mt-2 flex gap-2">
                        <button type="button" className="btn-ok px-2 py-1 text-xs" onClick={(e) => { e.preventDefault(); approvalAct('approve', [it.key]) }}>
                          Approve
                        </button>
                        <button type="button" className="btn-danger px-2 py-1 text-xs" onClick={(e) => { e.preventDefault(); approvalAct('reject', [it.key]) }}>
                          Reject
                        </button>
                      </div>
                    ) : null}
                  </div>
                </label>
              ))}
              {!approvalItems.length ? <p className="text-sm text-ink-500">No approval items on this profile.</p> : null}
            </div>
          </section>
        )}

        {!locked ? (
          <div className="flex gap-3 border-t border-ink-100 pt-4 print:hidden">
            <button type="submit" className="btn-primary" disabled={saving}>
              <Save size={16} /> {saving ? 'Saving…' : isNew ? 'Create member' : 'Save changes'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => onBack?.()}>
              Cancel
            </button>
          </div>
        ) : null}
      </form>
    </div>
  )
}
