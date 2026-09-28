import { useEffect, useState } from 'react'
import { api, resolveSiteLogo } from '../lib/api'
import { useAuth } from '../lib/auth'
import PasswordInput from '../components/PasswordInput'
import brandLogo from '../assets/logo.png'

export default function Login({ onSuccess }) {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState('login') // login | forgot
  const [forgotEmail, setForgotEmail] = useState('')
  const [tempInfo, setTempInfo] = useState(null)
  const [logoSrc, setLogoSrc] = useState(brandLogo)

  useEffect(() => {
    let cancelled = false
    api('/api/public/site-config')
      .then((res) => {
        if (!cancelled) setLogoSrc(resolveSiteLogo(res.config, brandLogo))
      })
      .catch(() => {
        if (!cancelled) setLogoSrc(brandLogo)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    setBusy(true)
    try {
      await login(username.trim(), password)
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleForgot(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    setTempInfo(null)
    setBusy(true)
    try {
      const res = await api('/api/admin/auth/forgot-password', {
        method: 'POST',
        body: { email: forgotEmail.trim() },
      })
      setMsg(res.message || 'If that email is registered, a temporary password has been issued.')
      if (res.tempPassword) {
        setTempInfo({ username: res.username, tempPassword: res.tempPassword })
        setUsername(res.username || '')
        setPassword(res.tempPassword)
      }
    } catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-accent-500/25 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <img
            src={logoSrc}
            alt="Melathalam Matrimony"
            className="mx-auto mb-4 h-14 w-auto max-w-[220px] object-contain"
          />
          <p className="page-kicker mb-2">Control center</p>
          <h1 className="font-display text-4xl text-ink-900">
            {mode === 'forgot' ? 'Reset password' : 'Admin Sign In'}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {mode === 'forgot'
              ? 'Enter your admin email to receive a temporary password'
              : 'Secure access to Melathalam Matrimony operations'}
          </p>
        </div>
        <div className="card p-8 shadow-glow">
          {mode === 'login' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label" htmlFor="username">
                  Username
                </label>
                <input
                  id="username"
                  className="input"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <PasswordInput
                id="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              {error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}
              {msg ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p>
              ) : null}
              <button type="submit" className="btn-primary w-full py-2.5" disabled={busy}>
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
              <button
                type="button"
                className="w-full text-center text-sm font-medium text-brand-700 hover:underline"
                onClick={() => {
                  setMode('forgot')
                  setError('')
                  setMsg('')
                }}
              >
                Forgot password?
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgot} className="space-y-5">
              <div>
                <label className="label" htmlFor="forgotEmail">
                  Admin email
                </label>
                <input
                  id="forgotEmail"
                  type="email"
                  className="input"
                  autoComplete="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@matrimony.local"
                  required
                />
              </div>
              {error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}
              {msg ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{msg}</p>
              ) : null}
              {tempInfo ? (
                <div className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-3 text-sm text-brand-900">
                  <p>
                    Username: <strong>{tempInfo.username}</strong>
                  </p>
                  <p>
                    Temporary password: <strong className="font-mono">{tempInfo.tempPassword}</strong>
                  </p>
                  <p className="mt-1 text-xs text-brand-700">
                    Sign in with this password, then change it under Site Settings → Change Password.
                  </p>
                </div>
              ) : null}
              <button type="submit" className="btn-primary w-full py-2.5" disabled={busy}>
                {busy ? 'Sending…' : 'Reset password'}
              </button>
              <button
                type="button"
                className="w-full text-center text-sm font-medium text-brand-700 hover:underline"
                onClick={() => {
                  setMode('login')
                  setError('')
                  setMsg('')
                }}
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-ink-500">Melathalam Matrimony Admin</p>
      </div>
    </div>
  )
}
