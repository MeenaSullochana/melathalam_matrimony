import { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Search,
  X,
} from 'lucide-react'

function downloadCsv(filename, columns, rows) {
  const exportable = columns.filter((c) => c.export !== false && c.key !== 'actions')
  const header = exportable.map((c) => `"${String(c.label || c.key).replace(/"/g, '""')}"`).join(',')
  const lines = rows.map((row) =>
    exportable
      .map((c) => {
        const raw = c.getExportValue
          ? c.getExportValue(row)
          : c.getValue
            ? c.getValue(row)
            : row[c.key]
        const val = raw == null ? '' : String(raw)
        return `"${val.replace(/"/g, '""')}"`
      })
      .join(','),
  )
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename || 'export'}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function cmp(a, b) {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' })
}

/**
 * Premium data table with search, filters, sort, pagination, CSV export.
 *
 * serverSide: parent owns page/total/search; clientSide (default): table filters locally.
 */
export default function DataTable({
  columns = [],
  rows = [],
  loading = false,
  emptyText = 'No records found',
  serverSide = false,
  page: pageProp,
  pageSize: pageSizeProp = 20,
  total: totalProp,
  onPageChange,
  onPageSizeChange,
  search: searchProp,
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = 'Search…',
  filters = [],
  toolbar = null,
  title,
  subtitle,
  exportFileName = 'export',
  onExport,
  rowKey = (row, i) => row.id ?? row._id ?? row.matri_id ?? i,
  dense = false,
}) {
  const [localSearch, setLocalSearch] = useState('')
  const [localPage, setLocalPage] = useState(1)
  const [localPageSize, setLocalPageSize] = useState(pageSizeProp)
  const [sortKey, setSortKey] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [colFilters, setColFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)

  const search = serverSide ? (searchProp ?? '') : localSearch
  const page = serverSide ? (pageProp ?? 1) : localPage
  const pageSize = serverSide ? (pageSizeProp ?? 20) : localPageSize

  const processed = useMemo(() => {
    let list = [...rows]
    if (!serverSide) {
      const q = search.trim().toLowerCase()
      if (q) {
        list = list.filter((row) =>
          columns.some((c) => {
            if (c.searchable === false || c.key === 'actions') return false
            const v = c.getValue ? c.getValue(row) : row[c.key]
            return String(v ?? '')
              .toLowerCase()
              .includes(q)
          }),
        )
      }
      Object.entries(colFilters).forEach(([key, val]) => {
        if (!val) return
        const col = columns.find((c) => c.key === key)
        list = list.filter((row) => {
          const v = col?.getValue ? col.getValue(row) : row[key]
          return String(v ?? '')
            .toLowerCase()
            .includes(String(val).toLowerCase())
        })
      })
    }
    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey)
      list.sort((a, b) => {
        const av = col?.getValue ? col.getValue(a) : a[sortKey]
        const bv = col?.getValue ? col.getValue(b) : b[sortKey]
        const r = cmp(av, bv)
        return sortDir === 'asc' ? r : -r
      })
    }
    return list
  }, [rows, columns, search, colFilters, sortKey, sortDir, serverSide])

  const total = serverSide ? (totalProp ?? rows.length) : processed.length
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, pages)

  const pageRows = useMemo(() => {
    if (serverSide) return processed
    const start = (safePage - 1) * pageSize
    return processed.slice(start, start + pageSize)
  }, [processed, serverSide, safePage, pageSize])

  function setPage(n) {
    if (serverSide) onPageChange?.(n)
    else setLocalPage(n)
  }

  function setPageSize(n) {
    if (serverSide) {
      onPageSizeChange?.(n)
      onPageChange?.(1)
    } else {
      setLocalPageSize(n)
      setLocalPage(1)
    }
  }

  function toggleSort(key, sortable) {
    if (sortable === false) return
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function handleExport() {
    if (onExport) {
      onExport({ columns, rows: serverSide ? rows : processed })
      return
    }
    downloadCsv(exportFileName, columns, serverSide ? rows : processed)
  }

  function submitSearch(e) {
    e?.preventDefault?.()
    if (serverSide) {
      onSearchSubmit?.(search)
    } else {
      setLocalPage(1)
    }
  }

  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, total)

  return (
    <div className="space-y-4">
      {(title || subtitle || toolbar) && (
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {title ? <h1 className="font-display text-3xl tracking-tight text-ink-900">{title}</h1> : null}
            {subtitle ? <p className="mt-1 text-sm text-ink-500">{subtitle}</p> : null}
          </div>
          {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-ink-200/80 bg-white shadow-premium">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink-100 bg-gradient-to-r from-ink-950/[0.03] to-transparent px-4 py-3">
          <form className="relative min-w-[200px] flex-1" onSubmit={submitSearch}>
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              className="input pl-9"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                const v = e.target.value
                if (serverSide) onSearchChange?.(v)
                else {
                  setLocalSearch(v)
                  setLocalPage(1)
                }
              }}
            />
          </form>

          {filters.map((f) => (
            <select
              key={f.key}
              className="input w-auto min-w-[140px]"
              value={f.value ?? ''}
              onChange={(e) => f.onChange?.(e.target.value)}
              aria-label={f.label}
            >
              <option value="">{f.label || f.key}</option>
              {(f.options || []).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}

          <button
            type="button"
            className={`btn-ghost ${showFilters ? 'bg-brand-50 text-brand-800' : ''}`}
            onClick={() => setShowFilters((s) => !s)}
            title="Column filters"
          >
            <Filter size={16} /> Filters
          </button>
          <button type="button" className="btn-secondary" onClick={handleExport} title="Export CSV">
            <Download size={16} /> Export
          </button>
        </div>

        {showFilters ? (
          <div className="grid gap-3 border-b border-ink-100 bg-ink-50/60 px-4 py-3 sm:grid-cols-2 lg:grid-cols-4">
            {columns
              .filter((c) => c.filterable !== false && c.key !== 'actions' && c.key !== 'photo')
              .map((c) => (
                <div key={c.key}>
                  <label className="label">{c.label}</label>
                  <div className="relative">
                    <input
                      className="input pr-8"
                      value={colFilters[c.key] || ''}
                      placeholder={`Filter ${c.label}…`}
                      onChange={(e) => {
                        setColFilters((prev) => ({ ...prev, [c.key]: e.target.value }))
                        if (!serverSide) setLocalPage(1)
                      }}
                      disabled={serverSide}
                    />
                    {colFilters[c.key] ? (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-500"
                        onClick={() => setColFilters((prev) => ({ ...prev, [c.key]: '' }))}
                      >
                        <X size={14} />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            {serverSide ? (
              <p className="sm:col-span-2 lg:col-span-4 text-xs text-ink-500">
                Column filters apply on the current page for server lists. Use search & status for full-database filtering.
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="table-wrap">
          <table className={`data-table ${dense ? 'data-table--dense' : ''}`}>
            <thead>
              <tr>
                {columns.map((c) => {
                  const sortable = c.sortable !== false && c.key !== 'actions' && c.key !== 'photo'
                  const active = sortKey === c.key
                  return (
                    <th key={c.key}>
                      <button
                        type="button"
                        className={`inline-flex items-center gap-1.5 ${sortable ? 'cursor-pointer hover:text-brand-700' : 'cursor-default'}`}
                        onClick={() => toggleSort(c.key, sortable)}
                        disabled={!sortable}
                      >
                        {c.label}
                        {sortable ? (
                          active ? (
                            sortDir === 'asc' ? (
                              <ArrowUp size={12} />
                            ) : (
                              <ArrowDown size={12} />
                            )
                          ) : (
                            <ArrowUpDown size={12} className="opacity-40" />
                          )
                        ) : null}
                      </button>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-ink-500">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                      Loading…
                    </span>
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center text-ink-500">
                    {emptyText}
                  </td>
                </tr>
              ) : (
                pageRows.map((row, i) => (
                  <tr key={rowKey(row, i)} className="group transition hover:bg-brand-50/40">
                    {columns.map((c) => (
                      <td key={c.key}>
                        {c.render ? c.render(row, i) : c.getValue ? c.getValue(row) : row[c.key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 bg-ink-50/40 px-4 py-3 text-sm">
          <div className="flex flex-wrap items-center gap-3 text-ink-500">
            <span>
              Showing <strong className="text-ink-800">{from}</strong>–<strong className="text-ink-800">{to}</strong> of{' '}
              <strong className="text-ink-800">{total}</strong>
            </span>
            <label className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide">Rows</span>
              <select
                className="input w-20 py-1.5"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-secondary px-2.5 py-1.5" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[7rem] text-center text-ink-600">
              Page {safePage} / {pages}
            </span>
            <button
              type="button"
              className="btn-secondary px-2.5 py-1.5"
              disabled={safePage >= pages}
              onClick={() => setPage(safePage + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { downloadCsv }
