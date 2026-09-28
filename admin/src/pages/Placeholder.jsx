export default function Placeholder({ title = 'Module' }) {
  return (
    <div className="card p-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Coming soon</p>
      <h1 className="mt-2 font-display text-2xl text-ink-900">Module: {title}</h1>
      <p className="mt-2 text-sm text-ink-500">This screen is wired in navigation and will be expanded next.</p>
    </div>
  )
}
