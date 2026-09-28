import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api'

const AuthContext = createContext(null)
const TOKEN_KEY = 'matrimony_admin_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(!!token)

  useEffect(() => {
    if (!token) {
      setAdmin(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    api('/api/admin/auth/me', { token })
      .then((data) => {
        if (!cancelled) setAdmin(data.admin)
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          setToken('')
          setAdmin(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token])

  const value = useMemo(
    () => ({
      token,
      admin,
      loading,
      async login(username, password) {
        const data = await api('/api/admin/auth/login', {
          method: 'POST',
          body: { username, password },
        })
        localStorage.setItem(TOKEN_KEY, data.token)
        setToken(data.token)
        setAdmin(data.admin)
        return data
      },
      logout() {
        localStorage.removeItem(TOKEN_KEY)
        setToken('')
        setAdmin(null)
      },
    }),
    [token, admin, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
