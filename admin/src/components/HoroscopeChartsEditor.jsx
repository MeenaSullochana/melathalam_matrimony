import './HoroscopeChartsEditor.css'

export const HOROSCOPE_PLANETS = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Raagu',
  'Kethu',
  'Gulikan',
  'Lagna',
]

export const PLANET_SHORT = {
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Raagu: 'Ra',
  Kethu: 'Ke',
  Gulikan: 'Gu',
  Lagna: 'La',
}

const HOUSE_LAYOUT = [
  [1, 2, 3, 4],
  [12, 0, 0, 5],
  [11, 0, 0, 6],
  [10, 9, 8, 7],
]

const DASA_PLANETS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Kethu']

export function emptyHoroscopeHouses() {
  const out = { janana1: '', janana2: '', janana3: '', janana4: '' }
  for (let i = 1; i <= 12; i++) {
    out[`rasi${i}`] = ''
    out[`amsam${i}`] = ''
  }
  return out
}

export function pickHoroscopeHouses(source = {}) {
  const out = emptyHoroscopeHouses()
  for (let i = 1; i <= 12; i++) {
    out[`rasi${i}`] = source[`rasi${i}`] ?? ''
    out[`amsam${i}`] = source[`amsam${i}`] ?? ''
  }
  out.janana1 = source.janana1 ?? ''
  out.janana2 = source.janana2 ?? ''
  out.janana3 = source.janana3 ?? ''
  out.janana4 = source.janana4 ?? ''
  return out
}

function parsePlanets(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function HouseCell({ house, value, onChange, disabled }) {
  const selected = parsePlanets(value)
  function toggle(planet) {
    if (disabled) return
    const next = selected.includes(planet)
      ? selected.filter((p) => p !== planet)
      : [...selected, planet]
    onChange(next.join(','))
  }
  return (
    <div className={`hc-cell${disabled ? ' hc-cell--locked' : ''}`}>
      <span className="hc-house">{house}</span>
      <div className="hc-chips">
        {HOROSCOPE_PLANETS.map((planet) => {
          const on = selected.includes(planet)
          return (
            <button
              key={planet}
              type="button"
              title={planet}
              className={`hc-chip${on ? ' hc-chip--on' : ''}`}
              disabled={disabled}
              onClick={() => toggle(planet)}
            >
              {PLANET_SHORT[planet] || planet.slice(0, 2)}
            </button>
          )
        })}
      </div>
      {selected.length ? <p className="hc-value">{selected.join(', ')}</p> : null}
    </div>
  )
}

function ChartGrid({ title, prefix, values, onChange, disabled }) {
  const cells = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const house = HOUSE_LAYOUT[r][c]
      if (house === 0) continue
      const field = `${prefix}${house}`
      cells.push(
        <div key={field} style={{ gridRow: r + 1, gridColumn: c + 1 }}>
          <HouseCell
            house={house}
            value={values[field]}
            disabled={disabled}
            onChange={(val) => onChange(field, val)}
          />
        </div>,
      )
    }
  }
  return (
    <div className="hc-chart">
      <div className="hc-chart__head">{title}</div>
      <div className="hc-grid">
        <div className="hc-center" style={{ gridColumn: '2 / 4', gridRow: '2 / 4' }}>
          {title}
        </div>
        {cells}
      </div>
    </div>
  )
}

/**
 * Editable South Indian RASI + AMSAM charts (rasi1–12, amsam1–12) + dasa balance.
 */
export default function HoroscopeChartsEditor({ values = {}, onChange, disabled = false }) {
  const set = (key, val) => onChange?.(key, val)

  return (
    <div className="hc-editor">
      <div className="hc-dasa">
        <p className="hc-dasa__title">Dasa balance</p>
        <div className="hc-dasa__row">
          <label>
            <span>Planet</span>
            <select
              value={values.janana1 || ''}
              disabled={disabled}
              onChange={(e) => set('janana1', e.target.value)}
            >
              <option value="">Select</option>
              {DASA_PLANETS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Years</span>
            <select value={values.janana2 || ''} disabled={disabled} onChange={(e) => set('janana2', e.target.value)}>
              <option value="">YY</option>
              {Array.from({ length: 21 }, (_, i) => (
                <option key={i} value={String(i)}>
                  {i}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Months</span>
            <select value={values.janana3 || ''} disabled={disabled} onChange={(e) => set('janana3', e.target.value)}>
              <option value="">MM</option>
              {Array.from({ length: 13 }, (_, i) => (
                <option key={i} value={String(i)}>
                  {i}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Days</span>
            <select value={values.janana4 || ''} disabled={disabled} onChange={(e) => set('janana4', e.target.value)}>
              <option value="">DD</option>
              {Array.from({ length: 32 }, (_, i) => (
                <option key={i} value={String(i)}>
                  {i}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="hc-hint">
        Click planet chips in each house to add or remove. Values save as comma-separated (legacy PHP format).
      </p>

      <div className="hc-charts">
        <ChartGrid title="RASI" prefix="rasi" values={values} onChange={set} disabled={disabled} />
        <ChartGrid title="AMSAM" prefix="amsam" values={values} onChange={set} disabled={disabled} />
      </div>
    </div>
  )
}
