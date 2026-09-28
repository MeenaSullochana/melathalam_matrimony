const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export function photoUrl(name, gender) {
  if (name && String(name).startsWith('http')) return name
  if (name && name !== 'default.png') {
    return `${API_BASE}/my_photos/${String(name).replace(/^\//, '')}`
  }
  const g = String(gender || '').toLowerCase()
  const file = g.startsWith('m') ? 'male.png' : 'female.png'
  return `${API_BASE}/img/${file}`
}

export function siteAssetUrl(name) {
  if (!name) return null
  const raw = String(name).trim()
  if (!raw || raw === '.' || raw === 'null' || raw === 'undefined') return null
  if (raw.startsWith('http')) return raw
  return `${API_BASE}/img/${raw.replace(/^\//, '').replace(/^\./, '')}`
}

/** Prefer uploaded site logo; falls back to bundled asset when provided. */
export function resolveSiteLogo(config, fallback) {
  const fromConfig = siteAssetUrl(config?.logo)
  return fromConfig || fallback || null
}

export function horoUrl(name) {
  if (!name) return null
  if (String(name).startsWith('http')) return name
  return `${API_BASE}/horoscope-list/${String(name).replace(/^\//, '')}`
}

export function docUrl(name) {
  if (!name) return null
  if (String(name).startsWith('http')) return name
  return `${API_BASE}/documents/${String(name).replace(/^\//, '')}`
}

export async function api(path, { method = 'GET', body, token, headers, formData } = {}) {
  const opts = {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  }
  if (formData) {
    opts.body = formData
  } else if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(`${API_BASE}${path}`, opts)
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.success === false) {
    const err = new Error(data.message || `Request failed (${res.status})`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export { API_BASE }
