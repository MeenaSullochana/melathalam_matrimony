import './PageShell.css'

export default function PageShell({
  eyebrow,
  title,
  subtitle,
  children,
  narrow = false,
  medium = false,
}) {
  const bodyWidth = medium
    ? 'page-shell__body--medium'
    : narrow
      ? 'page-shell__body--narrow'
      : ''

  return (
    <div className="page-shell">
      <header className="page-shell__hero">
        <div className="container page-shell__hero-inner">
          {eyebrow && <p className="page-shell__eyebrow">{eyebrow}</p>}
          <h1 className="page-shell__title">{title}</h1>
          {subtitle && <p className="page-shell__subtitle">{subtitle}</p>}
          <div className="floral-divider page-shell__divider" aria-hidden="true">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <path
                d="M9 13C8.7 12.8 2.5 8.4 1 5.2-.2 2.7.8.4 3.2.2c1.3-.1 2.6.6 3.3 1.7L9 5.2l2.5-3.3C12.2.8 13.5.1 14.8.2c2.4.2 3.4 2.5 2.2 5-1.5 3.2-7.7 7.6-8 7.8z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </header>
      <div className={`page-shell__body container ${bodyWidth}`.trim()}>
        {children}
      </div>
    </div>
  )
}
