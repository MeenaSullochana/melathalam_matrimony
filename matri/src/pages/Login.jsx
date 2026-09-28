import { useState } from 'react'
import { KeyRound, LogIn } from 'lucide-react'
import PageShell from '../components/PageShell'
import PasswordInput from '../components/PasswordInput'
import { api } from '../api'
import { useAuth } from '../auth'
import './Auth.css'

export default function Login({ onNavigate }) {
  const { login } = useAuth()
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState('login') // login | forgot | reset
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [issuedTemp, setIssuedTemp] = useState('')

  return (
    <PageShell
      eyebrow="Welcome Back"
      title={mode === 'login' ? 'Login' : mode === 'forgot' ? 'Forgot password' : 'Set new password'}
      subtitle={
        mode === 'login'
          ? 'Sign in to continue your match journey.'
          : mode === 'forgot'
            ? 'Enter your email or mobile to get a temporary password.'
            : 'Enter the temporary password and choose a new one.'
      }
      narrow
    >
      {mode === 'login' ? (
        <form
          className="page-card page-card--static auth-card"
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            setError('')
            setMsg('')
            try {
              await login(identifier, password)
              onNavigate('dashboard')
            } catch (err) {
              setError(err.message || 'Login failed')
            } finally {
              setBusy(false)
            }
          }}
        >
          {error ? <p className="auth-card__error">{error}</p> : null}
          {msg ? <p className="auth-card__success">{msg}</p> : null}
          <label className="auth-card__field">
            <span>Email or Mobile</span>
            <input
              type="text"
              name="identifier"
              placeholder="Email or phone number"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="auth-card__field">
            <span>Password</span>
            <PasswordInput
              name="password"
              placeholder="Your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <div className="auth-card__row">
            <label className="auth-card__check">
              <input type="checkbox" name="remember" />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="auth-card__link"
              onClick={() => {
                setMode('forgot')
                setError('')
                setMsg('')
              }}
            >
              Forgot password?
            </button>
          </div>
          <button type="submit" className="btn btn-primary auth-card__submit" disabled={busy}>
            <LogIn size={16} strokeWidth={2} />
            {busy ? 'Signing in…' : 'Login'}
          </button>
          <p className="auth-card__footer">
            New to Melathalam Matrimony?{' '}
            <button type="button" className="auth-card__link" onClick={() => onNavigate('register')}>
              Register Free
            </button>
          </p>
        </form>
      ) : null}

      {mode === 'forgot' ? (
        <form
          className="page-card page-card--static auth-card"
          onSubmit={async (e) => {
            e.preventDefault()
            setBusy(true)
            setError('')
            setMsg('')
            setIssuedTemp('')
            try {
              const res = await api('/api/auth/forgot-password', {
                method: 'POST',
                body: { identifier: identifier.trim() },
              })
              setMsg(res.message || 'If an account exists, a temporary password has been issued.')
              if (res.tempPassword) {
                setIssuedTemp(res.tempPassword)
                setTempPassword(res.tempPassword)
                setMode('reset')
              }
            } catch (err) {
              setError(err.message || 'Request failed')
            } finally {
              setBusy(false)
            }
          }}
        >
          {error ? <p className="auth-card__error">{error}</p> : null}
          {msg ? <p className="auth-card__success">{msg}</p> : null}
          <label className="auth-card__field">
            <span>Email or Mobile</span>
            <input
              type="text"
              placeholder="Registered email or phone"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
          </label>
          <button type="submit" className="btn btn-primary auth-card__submit" disabled={busy}>
            <KeyRound size={16} strokeWidth={2} />
            {busy ? 'Sending…' : 'Get temporary password'}
          </button>
          <button
            type="button"
            className="auth-card__link"
            onClick={() => {
              setMode('login')
              setError('')
              setMsg('')
            }}
          >
            Back to login
          </button>
        </form>
      ) : null}

      {mode === 'reset' ? (
        <form
          className="page-card page-card--static auth-card"
          onSubmit={async (e) => {
            e.preventDefault()
            if (newPassword !== confirm) {
              setError('New passwords do not match')
              return
            }
            setBusy(true)
            setError('')
            setMsg('')
            try {
              await api('/api/auth/reset-password', {
                method: 'POST',
                body: {
                  identifier: identifier.trim(),
                  tempPassword,
                  newPassword,
                },
              })
              setMsg('Password updated. Sign in with your new password.')
              setPassword(newPassword)
              setMode('login')
            } catch (err) {
              setError(err.message || 'Reset failed')
            } finally {
              setBusy(false)
            }
          }}
        >
          {error ? <p className="auth-card__error">{error}</p> : null}
          {msg ? <p className="auth-card__success">{msg}</p> : null}
          {issuedTemp ? (
            <p className="auth-card__success">
              Temporary password: <strong className="auth-card__mono">{issuedTemp}</strong>
            </p>
          ) : null}
          <label className="auth-card__field">
            <span>Email or Mobile</span>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="auth-card__field">
            <span>Temporary password</span>
            <PasswordInput
              required
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              autoComplete="one-time-code"
            />
          </label>
          <label className="auth-card__field">
            <span>New password</span>
            <PasswordInput
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 6 characters"
            />
          </label>
          <label className="auth-card__field">
            <span>Confirm new password</span>
            <PasswordInput
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" className="btn btn-primary auth-card__submit" disabled={busy}>
            <KeyRound size={16} strokeWidth={2} />
            {busy ? 'Saving…' : 'Update password'}
          </button>
          <button
            type="button"
            className="auth-card__link"
            onClick={() => {
              setMode('login')
              setError('')
              setMsg('')
            }}
          >
            Back to login
          </button>
        </form>
      ) : null}
    </PageShell>
  )
}
