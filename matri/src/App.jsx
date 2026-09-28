import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import TopBar from './components/TopBar'
import Footer from './components/Footer'
import Home from './pages/Home'
import ServicesPage from './pages/ServicesPage'
import StoriesPage from './pages/StoriesPage'
import About from './pages/About'
import Membership from './pages/Membership'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import PolicyPage from './pages/PolicyPage'
import UserLayout from './pages/user/UserLayout'
import Dashboard from './pages/user/Dashboard'
import Profile from './pages/user/Profile'
import Matches from './pages/user/Matches'
import Interests from './pages/user/Interests'
import Upgrade from './pages/user/Upgrade'
import Settings from './pages/user/Settings'
import { useAuth } from './auth'
import { useT } from './i18n/LanguageContext'

const POLICY_PAGES = new Set(['terms', 'privacy', 'report-misuse', 'refund', 'faq'])

const USER_PAGES = new Set([
  'dashboard',
  'profile',
  'matches',
  'interests',
  'upgrade',
  'settings',
])

const VALID_PAGES = new Set([
  'home',
  'services',
  'stories',
  'about',
  'membership',
  'contact',
  'login',
  'register',
  ...POLICY_PAGES,
  ...USER_PAGES,
])

function getPageFromHash() {
  const raw = window.location.hash.replace(/^#\/?/, '').split(/[/?#]/)[0]
  if (!raw || raw === 'home') return 'home'
  return VALID_PAGES.has(raw) ? raw : 'home'
}

function navigateTo(page) {
  const next = page === 'home' ? '#/' : `#/${page}`
  if (window.location.hash === next) {
    window.scrollTo(0, 0)
    return
  }
  window.location.hash = next
}

export default function App() {
  const [page, setPage] = useState(getPageFromHash)
  const { isLoggedIn, loading } = useAuth()
  const t = useT()

  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash())
    window.addEventListener('hashchange', onHashChange)
    if (!window.location.hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/`)
    }
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])

  useEffect(() => {
    if (loading) return
    if (USER_PAGES.has(page) && !isLoggedIn) {
      navigateTo('login')
    }
  }, [page, isLoggedIn, loading])

  if (USER_PAGES.has(page)) {
    if (loading) return <div style={{ padding: 48, textAlign: 'center' }}>{t('common.loading')}</div>
    if (!isLoggedIn) return null

    let userContent = <Dashboard onNavigate={navigateTo} />
    if (page === 'profile') userContent = <Profile />
    else if (page === 'matches') userContent = <Matches />
    else if (page === 'interests') userContent = <Interests />
    else if (page === 'upgrade') userContent = <Upgrade />
    else if (page === 'settings') userContent = <Settings onNavigate={navigateTo} />

    return (
      <UserLayout currentPage={page} onNavigate={navigateTo}>
        {userContent}
      </UserLayout>
    )
  }

  let content = <Home onNavigate={navigateTo} />
  if (page === 'services') content = <ServicesPage />
  else if (page === 'stories') content = <StoriesPage />
  else if (page === 'about') content = <About />
  else if (page === 'membership') content = <Membership />
  else if (page === 'contact') content = <Contact />
  else if (page === 'login') content = <Login onNavigate={navigateTo} />
  else if (page === 'register') content = <Register onNavigate={navigateTo} />
  else if (POLICY_PAGES.has(page)) content = <PolicyPage pageId={page} />

  return (
    <>
      <TopBar onNavigate={navigateTo} />
      <Navbar currentPage={page} onNavigate={navigateTo} />
      <main>{content}</main>
      <Footer onNavigate={navigateTo} />
    </>
  )
}
