import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from './api'

const AuthContext = createContext(null)
const TOKEN_KEY = 'matrimony_member_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '')
  const [member, setMember] = useState(null)
  const [loading, setLoading] = useState(!!token)

  useEffect(() => {
    if (!token) {
      setMember(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    api('/api/auth/me', { token })
      .then((data) => {
        if (!cancelled) setMember(data.member)
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          setToken('')
          setMember(null)
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
      member,
      loading,
      isLoggedIn: !!token && !!member,
      async login(identifier, password) {
        const data = await api('/api/auth/login', {
          method: 'POST',
          body: { identifier, password },
        })
        localStorage.setItem(TOKEN_KEY, data.token)
        setToken(data.token)
        setMember(data.member)
        return data
      },
      async register(payload) {
        const data = await api('/api/auth/register', {
          method: 'POST',
          body: payload,
        })
        localStorage.setItem(TOKEN_KEY, data.token)
        setToken(data.token)
        setMember(data.member)
        return data
      },
      async refresh() {
        if (!token) return null
        const data = await api('/api/auth/me', { token })
        setMember(data.member)
        return data.member
      },
      async logout() {
        try {
          if (token) await api('/api/auth/logout', { method: 'POST', token })
        } catch {
          /* ignore */
        }
        localStorage.removeItem(TOKEN_KEY)
        setToken('')
        setMember(null)
      },
    }),
    [token, member, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
