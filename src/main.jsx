/**
 * Single entry — website at /  ·  admin at /admin
 */
const isAdmin = window.location.pathname.startsWith('/admin')

if (isAdmin) {
  document.title = 'Matrimony Admin'
  document.body.className = 'bg-ink-100 text-ink-900 antialiased'
  // Keep URL under /admin so site and admin hashes never clash
  if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
    /* ok */
  } else if (!window.location.pathname.startsWith('/admin')) {
    window.history.replaceState(null, '', '/admin' + window.location.hash)
  }
  import('./boot-admin.jsx')
} else {
  document.title = 'Melathalam Matrimonial'
  document.body.className = ''
  import('./boot-matri.jsx')
}
