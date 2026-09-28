import { useEffect, useMemo, useState } from 'react'
import { useAuth } from './lib/auth'
import Shell from './components/Shell'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import MemberDetail from './pages/MemberDetail'
import MemberHistory from './pages/MemberHistory'
import Renewals from './pages/Renewals'
import MasterData from './pages/MasterData'
import Approvals from './pages/Approvals'
import Plans from './pages/Plans'
import Cms from './pages/Cms'
import Activity from './pages/Activity'
import SiteSettings from './pages/SiteSettings'
import Reports from './pages/Reports'
import EmailTemplates from './pages/EmailTemplates'
import Matchmaking from './pages/Matchmaking'
import PaymentMethods from './pages/PaymentMethods'
import SendEmail from './pages/SendEmail'
import DatabaseBackup from './pages/DatabaseBackup'
import Enquiries from './pages/Enquiries'
import Services from './pages/Services'
import SuccessStoriesManage from './pages/SuccessStoriesManage'
import Placeholder from './pages/Placeholder'

function parseRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '')
  if (!hash || hash === 'login') return { page: 'login', raw: 'login', parts: [], query: {} }
  const [pathPart, queryPart = ''] = hash.split('?')
  const parts = pathPart.split('/').filter(Boolean)
  const query = Object.fromEntries(new URLSearchParams(queryPart))
  return { page: parts[0] || 'dashboard', parts, query, raw: hash }
}

function go(path) {
  window.location.hash = `#/${path}`
}

export default function App() {
  const { token, loading } = useAuth()
  const [route, setRoute] = useState(parseRoute)

  useEffect(() => {
    const onHash = () => setRoute(parseRoute())
    window.addEventListener('hashchange', onHash)
    if (!window.location.hash) window.location.hash = '#/login'
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (loading) return
    if (!token && route.page !== 'login') go('login')
    if (token && route.page === 'login') go('dashboard')
  }, [token, loading, route.page])

  const content = useMemo(() => {
    const { page, parts, query, raw } = route
    if (page === 'dashboard') {
      return (
        <Dashboard
          onOpenMember={(id) => {
            const mid = String(id || '').trim()
            if (mid) go(`members/${encodeURIComponent(mid)}`)
          }}
        />
      )
    }
    if (page === 'members') {
      const sub = parts[1]
      const action = parts[2]
      if (sub === 'new') {
        return <MemberDetail mode="add" onBack={() => go('members')} />
      }
      if (sub && !['active', 'paid', 'featured', 'plans', 'renewals'].includes(sub)) {
        const mid = decodeURIComponent(sub).trim()
        if (action === 'print') {
          return <MemberDetail matriId={mid} mode="print" onBack={() => go(`members/${encodeURIComponent(mid)}`)} />
        }
        if (action === 'view') {
          return <MemberDetail matriId={mid} mode="view" onBack={() => go('members')} />
        }
        if (action === 'history') {
          return <MemberHistory matriId={mid} onBack={() => go('members')} />
        }
        return <MemberDetail matriId={mid} mode="edit" onBack={() => go('members')} />
      }
      if (sub === 'renewals') {
        return <Renewals onOpen={(id) => go(`members/${encodeURIComponent(String(id).trim())}`)} />
      }
      if (sub === 'plans') {
        return (
          <Members
            mode="plans"
            onOpen={(id) => go(`members/${encodeURIComponent(String(id).trim())}`)}
            onView={(id) => go(`members/${encodeURIComponent(String(id).trim())}/view`)}
            onPrint={(id) => go(`members/${encodeURIComponent(String(id).trim())}/print`)}
            onHistory={(id) => go(`members/${encodeURIComponent(String(id).trim())}/history`)}
            onAdd={() => go('members/new')}
          />
        )
      }
      const preset =
        sub === 'active' ? 'Active' : sub === 'paid' ? 'Paid' : sub === 'featured' ? 'Featured' : ''
      return (
        <Members
          presetStatus={preset === 'Featured' ? '' : preset}
          presetFeatured={preset === 'Featured'}
          renewMode={sub === 'paid'}
          onOpen={(id) => go(`members/${encodeURIComponent(String(id).trim())}`)}
          onView={(id) => go(`members/${encodeURIComponent(String(id).trim())}/view`)}
          onPrint={(id) => go(`members/${encodeURIComponent(String(id).trim())}/print`)}
          onHistory={(id) => go(`members/${encodeURIComponent(String(id).trim())}/history`)}
          onAdd={() => go('members/new')}
        />
      )
    }
    if (page === 'master') return <MasterData type={parts[1] || 'religion'} />
    if (page === 'approvals') {
      const kind = parts[1] === 'success-stories' ? 'success-stories' : 'pending'
      return (
        <Approvals
          kind={kind}
          onOpenMember={(id) => go(`members/${encodeURIComponent(String(id).trim())}`)}
        />
      )
    }
    if (page === 'plans') return <Plans mode={parts[1] === 'manage' ? 'manage' : 'list'} />
    if (page === 'cms') return <Cms />
    if (page === 'activity') return <Activity tab={parts[1] || 'interests'} />
    if (page === 'enquiries') return <Enquiries />
    if (page === 'services') return <Services />
    if (page === 'success-stories') return <SuccessStoriesManage />
    if (page === 'settings') {
      const section = parts[1] === 'fields' ? 'basic' : parts[1] || 'basic'
      return <SiteSettings section={section} />
    }
    if (page === 'reports') return <Reports kind={parts[1] || 'members'} />
    if (page === 'email-templates') return <EmailTemplates mode={parts[1] === 'new' ? 'new' : 'list'} />
    if (page === 'matchmaking') return <Matchmaking />
    if (page === 'payments') return <PaymentMethods />
    if (page === 'email') return <SendEmail />
    if (page === 'database') return <DatabaseBackup />
    return <Placeholder title={raw || page} />
  }, [route])

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center text-ink-500">
        Loading admin…
      </div>
    )
  }

  if (!token) {
    return <Login onSuccess={() => go('dashboard')} />
  }

  return (
    <Shell route={route} onNavigate={go}>
      {content}
    </Shell>
  )
}
