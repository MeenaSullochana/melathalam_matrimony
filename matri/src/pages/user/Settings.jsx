import { useState } from 'react'
import { KeyRound, LogOut, Shield } from 'lucide-react'
import { api } from '../../api'
import { useAuth } from '../../auth'
import PasswordInput from '../../components/PasswordInput'
import '../Auth.css'
import './user-pages.css'

export default function Settings({ onNavigate }) {
  const { token, logout } = useAuth()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')

  const onPasswordSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (next !== confirm) {
      setError('New passwords do not match')
      return
    }
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        token,
        body: { oldPassword: current, newPassword: next },
      })
      setSaved(true)
      setCurrent('')
      setNext('')
      setConfirm('')
      setTimeout(() => setSaved(false), 2200)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="user-page">
      <section className="user-panel">
        <div className="user-panel__head">
          <div>
            <h2 className="user-panel__title">Settings</h2>
            <p className="user-panel__sub">Manage password and account access.</p>
          </div>
        </div>

        <form className="settings-form" onSubmit={onPasswordSubmit}>
          <div className="settings-block">
            <div className="settings-block__icon">
              <KeyRound size={18} />
            </div>
            <div className="settings-block__body">
              <h3>Change password</h3>
              <p>Use a strong password you don’t reuse elsewhere.</p>
              {error ? <p style={{ color: '#b42318' }}>{error}</p> : null}
              <div className="user-form-grid settings-form__grid">
                <label className="user-field">
                  <span>Current password</span>
                  <PasswordInput
                    name="current"
                    required
                    placeholder="••••••••"
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    autoComplete="current-password"
                  />
                </label>
                <label className="user-field">
                  <span>New password</span>
                  <PasswordInput
                    name="next"
                    required
                    placeholder="••••••••"
                    minLength={6}
                    value={next}
                    onChange={(e) => setNext(e.target.value)}
                    autoComplete="new-password"
                  />
                </label>
                <label className="user-field user-form-grid--full">
                  <span>Confirm new password</span>
                  <PasswordInput
                    name="confirm"
                    required
                    placeholder="••••••••"
                    minLength={6}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                </label>
              </div>
              <button type="submit" className="btn btn-primary settings-block__btn">
                <Shield size={15} />
                Update Password
              </button>
              {saved && <p className="settings-toast">Password updated successfully.</p>}
            </div>
          </div>
        </form>

        <div className="settings-block settings-block--danger">
          <div className="settings-block__icon settings-block__icon--danger">
            <LogOut size={18} />
          </div>
          <div className="settings-block__body">
            <h3>Logout</h3>
            <p>Sign out of Melathalam Matrimony on this device.</p>
            <button
              type="button"
              className="btn btn-outline settings-block__btn"
              onClick={async () => {
                await logout()
                onNavigate('login')
              }}
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
