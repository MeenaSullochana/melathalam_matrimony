import { useEffect, useMemo, useState } from 'react'
import { Upload } from 'lucide-react'
import { api, siteAssetUrl } from '../lib/api'
import { useAuth } from '../lib/auth'
import PasswordInput from '../components/PasswordInput'

const DEFAULT_FIELD_KEYS = [
  'religion',
  'caste',
  'subcaste',
  'mother_tongue',
  'education',
  'occupation',
  'income',
  'height',
  'weight',
  'diet',
  'complexion',
  'body_type',
  'manglik',
  'star',
  'moonsign',
  'birthplace',
  'birthtime',
  'family_type',
  'family_status',
  'family_value',
  'father_name',
  'mother_name',
  'about_me',
  'partner_expectation',
  'horoscope',
  'aadhaar',
  'photo',
  'address',
  'country',
  'state',
  'city',
  'marital_status',
  'children',
  'smoke',
  'drink',
  'hobby',
  'language_known',
]

const DEFAULT_EMAIL_KEYS = [
  'smtp_host',
  'smtp_port',
  'smtp_secure',
  'smtp_user',
  'smtp_pass',
  'from_email',
  'from_name',
  'reply_to',
  'mail_enabled',
]

const SECTION_META = {
  basic: { title: 'Basic site settings', source: 'site', keys: ['web_name', 'web_title', 'web_keyword', 'web_description', 'contact_email', 'contact_phone', 'address'] },
  social: { title: 'Social media links', source: 'site', keys: ['facebook', 'twitter', 'instagram', 'youtube', 'linkedin'] },
  analytics: { title: 'Analytics code', source: 'site', keys: ['google_analytics', 'header_code', 'footer_code'] },
  logo: { title: 'Favicon & logo', source: 'upload', fileKeys: ['favicon', 'logo', 'logo_footer'] },
  banner: { title: 'Home page banner', source: 'upload', fileKeys: ['banner_image'], textKeys: ['banner_title', 'banner_text', 'banner_link'] },
  enquiry: { title: 'Enquiry popup image', source: 'upload', fileKeys: ['enquiry_image'] },
  watermark: { title: 'Photo watermark', source: 'upload', fileKeys: ['watermark_image'], textKeys: ['watermark_status', 'watermark_position'] },
  'profile-id': { title: 'Update profile ID prefix', source: 'site', keys: ['matri_prefix', 'matri_start_id'] },
  defaults: {
    title: 'Default images & membership gates',
    source: 'upload',
    fileKeys: ['default_male_photo', 'default_female_photo', 'default_horoscope', 'default_document'],
    textKeys: ['interest_setting', 'profile_view_setting', 'contact_view_setting', 'username_setting'],
  },
  fields: { title: 'Enable / disable fields', source: 'fields' },
  email: { title: 'Email settings', source: 'email' },
  password: { title: 'Change password', source: 'password' },
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-ink-100 px-4 py-3">
      <span className="text-sm font-medium text-ink-800">{label}</span>
      <input type="checkbox" className="h-4 w-4 rounded border-ink-300 text-brand-600" checked={!!checked} onChange={(e) => onChange(e.target.checked ? 'Yes' : 'No')} />
    </label>
  )
}

function FileField({ label, name, preview, file, onFile }) {
  return (
    <div className="rounded-xl border border-ink-100 p-4">
      <label className="label">{label}</label>
      <div className="flex flex-wrap items-center gap-4">
        {preview || file ? (
          <img
            src={file ? URL.createObjectURL(file) : siteAssetUrl(preview)}
            alt=""
            className="h-20 w-20 rounded-lg border object-contain bg-white"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-ink-100 text-xs text-ink-500">No file</div>
        )}
        <label className="btn-secondary cursor-pointer">
          <Upload size={16} /> Choose file
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(name, e.target.files?.[0] || null)}
          />
        </label>
        {file ? <span className="text-xs text-ink-500">{file.name}</span> : preview ? <span className="text-xs text-ink-500">{preview}</span> : null}
      </div>
    </div>
  )
}

function seedFields(raw = {}) {
  const out = {}
  for (const key of DEFAULT_FIELD_KEYS) {
    out[key] = raw[key] === 'No' || raw[key] === false || raw[key] === '0' ? 'No' : 'Yes'
  }
  return out
}

function seedEmail(raw = {}) {
  const out = {}
  for (const key of DEFAULT_EMAIL_KEYS) {
    out[key] = raw[key] ?? (key === 'smtp_port' ? '587' : key === 'smtp_secure' ? 'tls' : key === 'from_name' ? 'Melathalam Matrimony' : key === 'mail_enabled' ? 'No' : '')
  }
  return out
}

export default function SiteSettings({ section = 'basic' }) {
  const { token } = useAuth()
  const meta = useMemo(() => SECTION_META[section] || SECTION_META.basic, [section])
  const [data, setData] = useState({})
  const [files, setFiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [pwd, setPwd] = useState({ oldPassword: '', newPassword: '', confirm: '' })

  useEffect(() => {
    setMsg('')
    setError('')
    setFiles({})
    if (section === 'password') {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    const path =
      meta.source === 'fields'
        ? '/api/admin/settings/fields'
        : meta.source === 'email'
          ? '/api/admin/settings/email-setting'
          : '/api/admin/settings/site'
    api(path, { token })
      .then((res) => {
        if (cancelled) return
        if (meta.source === 'fields') setData(seedFields(res.fields || {}))
        else if (meta.source === 'email') setData(seedEmail(res.setting || {}))
        else {
          const cfg = res.config || {}
          setData({
            ...cfg,
            web_name: cfg.web_name || 'Melathalam Matrimony',
            web_title: cfg.web_title || 'Melathalam Matrimony',
          })
        }
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
        if (meta.source === 'fields') setData(seedFields())
        else if (meta.source === 'email') setData(seedEmail())
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, section, meta.source])

  async function saveSite(body) {
    setMsg('')
    setError('')
    try {
      if (meta.source === 'fields') {
        const res = await api('/api/admin/settings/fields', { method: 'PUT', token, body })
        setData(seedFields(res.fields || body))
      } else if (meta.source === 'email') {
        const res = await api('/api/admin/settings/email-setting', { method: 'PUT', token, body })
        setData(seedEmail(res.setting || body))
      } else if (meta.source === 'upload') {
        const fd = new FormData()
        Object.entries(body).forEach(([k, v]) => {
          if (v != null && v !== '') fd.append(k, v)
        })
        Object.entries(files).forEach(([k, f]) => {
          if (f) fd.append(k, f)
        })
        const res = await api('/api/admin/settings/site/upload', { method: 'POST', token, formData: fd })
        setData(res.config || body)
        setFiles({})
      } else {
        const res = await api('/api/admin/settings/site', { method: 'PUT', token, body })
        setData(res.config || body)
      }
      setMsg('Settings saved')
    } catch (err) {
      setError(err.message)
    }
  }

  async function submitPassword(e) {
    e.preventDefault()
    if (pwd.newPassword !== pwd.confirm) {
      setError('New passwords do not match')
      return
    }
    setError('')
    try {
      await api('/api/admin/auth/change-password', {
        method: 'POST',
        token,
        body: { oldPassword: pwd.oldPassword, newPassword: pwd.newPassword },
      })
      setMsg('Password updated')
      setPwd({ oldPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="text-sm text-ink-500">Loading settings…</p>

  if (section === 'password') {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="font-display text-2xl text-ink-900">{meta.title}</h1>
        <form className="card space-y-4 p-6" onSubmit={submitPassword}>
          {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <PasswordInput
            id="oldPassword"
            label="Current password"
            value={pwd.oldPassword}
            onChange={(e) => setPwd((p) => ({ ...p, oldPassword: e.target.value }))}
            autoComplete="current-password"
            required
          />
          <PasswordInput
            id="newPassword"
            label="New password"
            value={pwd.newPassword}
            onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
            autoComplete="new-password"
            required
            minLength={6}
          />
          <PasswordInput
            id="confirmPassword"
            label="Confirm new password"
            value={pwd.confirm}
            onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
            autoComplete="new-password"
            required
            minLength={6}
          />
          <button type="submit" className="btn-primary">Update password</button>
        </form>
      </div>
    )
  }

  const fieldKeys =
    meta.source === 'fields'
      ? DEFAULT_FIELD_KEYS
      : meta.source === 'email'
        ? DEFAULT_EMAIL_KEYS
        : meta.keys || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink-900">{meta.title}</h1>
        <p className="text-sm text-ink-500">Stored in MongoDB site configuration</p>
      </div>

      {msg ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <form
        className="card space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault()
          saveSite(data)
        }}
      >
        {meta.source === 'fields' ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {fieldKeys.map((key) => (
              <ToggleRow
                key={key}
                label={key.replace(/_/g, ' ')}
                checked={data[key] === 'Yes' || data[key] === true || data[key] === '1'}
                onChange={(val) => setData((d) => ({ ...d, [key]: val }))}
              />
            ))}
          </div>
        ) : meta.source === 'email' ? (
          <div className="space-y-3">
            {fieldKeys.map((key) => (
              <div key={key}>
                <label className="label">{key.replace(/_/g, ' ')}</label>
                {key === 'smtp_pass' ? (
                  <PasswordInput
                    id={`email-${key}`}
                    value={data[key] ?? ''}
                    onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}
                    autoComplete="new-password"
                  />
                ) : key === 'mail_enabled' ? (
                  <select className="input" value={data[key] ?? 'No'} onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                ) : key === 'smtp_secure' ? (
                  <select className="input" value={data[key] ?? 'tls'} onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}>
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">None</option>
                  </select>
                ) : (
                  <input className="input" value={data[key] ?? ''} onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
        ) : meta.source === 'upload' ? (
          <div className="space-y-4">
            {(meta.fileKeys || []).map((key) => (
              <FileField
                key={key}
                label={key.replace(/_/g, ' ')}
                name={key}
                preview={data[key]}
                file={files[key]}
                onFile={(name, file) => setFiles((f) => ({ ...f, [name]: file }))}
              />
            ))}
            {(meta.textKeys || []).map((key) => (
              <div key={key}>
                <label className="label">{key.replace(/_/g, ' ')}</label>
                {key === 'interest_setting' || key === 'profile_view_setting' || key === 'contact_view_setting' ? (
                  <select className="input" value={data[key] ?? (key === 'contact_view_setting' ? 'Paid' : 'All')} onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}>
                    <option value="All">All members</option>
                    <option value="Paid">Paid members only</option>
                  </select>
                ) : key.includes('text') ? (
                  <textarea className="input min-h-[80px]" value={data[key] ?? ''} onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))} />
                ) : (
                  <input className="input" value={data[key] ?? ''} onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
        ) : (
          fieldKeys.map((key) => (
            <div key={key}>
              <label className="label">{key.replace(/_/g, ' ')}</label>
              {String(key).includes('code') || key === 'web_description' ? (
                <textarea className="input min-h-[100px] font-mono text-xs" value={data[key] ?? ''} onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))} />
              ) : (
                <input className="input" value={data[key] ?? ''} onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))} />
              )}
            </div>
          ))
        )}
        <button type="submit" className="btn-primary">
          Save settings
        </button>
      </form>
    </div>
  )
}
