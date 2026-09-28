import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { LOCALES, translations } from './translations'

const STORAGE_KEY = 'melathalam_lang'
const LanguageContext = createContext(null)

function readStoredLang() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'en' || raw === 'ta') return raw
  } catch {
    /* ignore */
  }
  return 'en'
}

function lookup(dict, path) {
  const parts = String(path || '').split('.')
  let cur = dict
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = cur[part]
  }
  return typeof cur === 'string' ? cur : undefined
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang)

  const setLang = useCallback((next) => {
    const code = next === 'ta' ? 'ta' : 'en'
    setLangState(code)
    try {
      localStorage.setItem(STORAGE_KEY, code)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'ta' ? 'ta' : 'en'
  }, [lang])

  const t = useCallback(
    (key, fallback) => {
      const fromActive = lookup(translations[lang], key)
      if (fromActive) return fromActive
      const fromEn = lookup(translations.en, key)
      if (fromEn) return fromEn
      return fallback ?? key
    },
    [lang],
  )

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
      locales: LOCALES,
      isTamil: lang === 'ta',
    }),
    [lang, setLang, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

export function useT() {
  return useLanguage().t
}
