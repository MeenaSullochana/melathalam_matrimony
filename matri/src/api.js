const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

let cachedDefaults = null

export async function loadSiteDefaults() {
  if (cachedDefaults) return cachedDefaults
  try {
    const res = await fetch(`${API_BASE}/api/public/site-config`)
    const data = await res.json()
    cachedDefaults = data.config || {}
  } catch {
    cachedDefaults = {}
  }
  return cachedDefaults
}

export function siteAssetUrl(name) {
  if (!name) return null
  if (String(name).startsWith('http')) return name
  return `${API_BASE}/img/${String(name).replace(/^\//, '')}`
}

/** Prefer uploaded site logo; falls back to bundled asset when provided. */
export function resolveSiteLogo(config, fallback) {
  const fromConfig = siteAssetUrl(config?.logo)
  return fromConfig || fallback || null
}

export function photoUrl(name, gender) {
  if (name && name !== 'default.png' && !String(name).startsWith('http')) {
    return `${API_BASE}/my_photos/${name}`
  }
  if (name && String(name).startsWith('http')) return name
  const g = String(gender || '').toLowerCase()
  const file = g.startsWith('m')
    ? cachedDefaults?.default_male_photo || 'male.png'
    : cachedDefaults?.default_female_photo || 'female.png'
  return `${API_BASE}/img/${file}`
}

export function horoUrl(name) {
  if (!name) {
    const def = cachedDefaults?.default_horoscope
    return def ? `${API_BASE}/img/${def}` : null
  }
  if (String(name).startsWith('http')) return name
  return `${API_BASE}/horoscope-list/${String(name).replace(/^\//, '')}`
}

export function docUrl(name) {
  if (!name) return null
  if (String(name).startsWith('http')) return name
  return `${API_BASE}/documents/${String(name).replace(/^\//, '')}`
}

export async function api(path, { method = 'GET', body, token, headers } = {}) {
  const opts = {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  }
  if (body !== undefined) opts.body = JSON.stringify(body)
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
