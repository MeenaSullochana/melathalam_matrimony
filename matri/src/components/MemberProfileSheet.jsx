import { useEffect, useState } from 'react'
import { loadSiteDefaults, photoUrl, horoUrl, docUrl, resolveSiteLogo } from '../api'
import brandLogo from '../assets/logo/logo.png'
import './MemberProfileSheet.css'

function v(x, fallback = '-') {
  if (x == null) return fallback
  const s = String(x).trim()
  if (!s || s === 'Not Available' || s === '0') return fallback
  return s
}

function joinParts(...parts) {
  const cleaned = parts.map((p) => (p == null ? '' : String(p).trim())).filter((p) => p && p !== '-' && p !== 'Not Available')
  return cleaned.length ? cleaned.join(' / ') : '-'
}

function dashParts(...parts) {
  const cleaned = parts.map((p) => (p == null ? '' : String(p).trim())).filter((p) => p && p !== '-' && p !== 'Not Available')
  return cleaned.length ? cleaned.join(' - ') : '-'
}

function formatRegDate(raw) {
  if (!raw) return '-'
  const d = new Date(raw)
  if (Number.isNaN(d.getTime())) return String(raw)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

function chartCells(member, prefix) {
  const houseAt = [
    [1, 2, 3, 4],
    [12, 0, 0, 5],
    [11, 0, 0, 6],
    [10, 9, 8, 7],
  ]
  const cells = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const h = houseAt[r][c]
      if (h === 0) {
        if (r === 1 && c === 1) {
          cells.push(
            <div key={`${prefix}-center`} className="cell center">
              {prefix === 'rasi' ? 'RASI' : 'AMSAM'}
            </div>,
          )
        }
        continue
      }
      const txt = String(member[`${prefix}${h}`] ?? '').trim()
      const show =
        txt && !/^select some/i.test(txt) && txt.toLowerCase() !== 'not available' ? txt : '\u00a0'
      cells.push(
        <div key={`${prefix}${h}`} className="cell">
          {show}
        </div>,
      )
    }
  }
  return cells
}

/**
 * PHP-style combined biodata sheet for view + print.
 * @param {{ member: object, siteName?: string, mode?: 'admin'|'user'|'public', printOnly?: boolean, hideContact?: boolean }} props
 */
export default function MemberProfileSheet({
  member = {},
  siteName = 'Melathalam Matrimony',
  mode = 'admin',
  printOnly = false,
  hideContact = false,
  onEdit,
  onPrint,
}) {
  const [logoSrc, setLogoSrc] = useState(brandLogo)
  const m = member || {}
  const fullName = [m.firstname, m.lastname].filter(Boolean).join(' ') || m.username || '-'
  const photo =
    photoUrl(m.photo1, m.gender) ||
    photoUrl(m.photo2, m.gender) ||
    `/img/${String(m.gender || 'female').toLowerCase()}.png`
  const mobile = [m.mobile_code, m.mobile].filter(Boolean).join('-') || m.mobile
  const location = [m.city_name || m.city, m.state_name, m.country_name].filter(Boolean).join(', ') || '-'
  const canHoro = mode !== 'public'
  const dasa = [m.janana1, m.janana2 ? `${m.janana2} Year(s)` : '', m.janana3 ? `${m.janana3} Month(s)` : '', m.janana4 ? `${m.janana4} Day(s)` : '']
    .filter(Boolean)
    .join(' ')

  useEffect(() => {
    let cancelled = false
    loadSiteDefaults().then((config) => {
      if (!cancelled) setLogoSrc(resolveSiteLogo(config, brandLogo))
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="bd-sheet" id="biodata">
      <div className="bd-topbar">
        <div>
          <strong>Reg. No.:</strong> {v(m.matri_id)}
        </div>
        <div>
          <strong>Name:</strong> {v(fullName)}
        </div>
        <div>
          <strong>Reg. Date:</strong> {formatRegDate(m.reg_date || m.createdAt)}
        </div>
        {mode === 'admin' ? (
          <div>
            <strong>Status:</strong> {v(m.status)}
          </div>
        ) : null}
      </div>

      <div className="bd-body">
        {!printOnly ? (
          <div className="bd-actions no-print" style={{ marginBottom: 12 }}>
            {onEdit ? (
              <button type="button" className="btn-secondary" onClick={onEdit}>
                Edit Profile
              </button>
            ) : null}
            {onPrint ? (
              <button type="button" className="btn-primary" onClick={onPrint}>
                Print / Download
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="bd-grid">
          <div>
            <table className="bd-kv">
              <tbody>
                <tr>
                  <td>Gender / Marital Status</td>
                  <td>{dashParts(m.gender, m.m_status)}</td>
                </tr>
                <tr>
                  <td>DOB / Time / Place</td>
                  <td>{dashParts(m.birthdate, m.birthtime, m.birthplace)}</td>
                </tr>
                <tr>
                  <td>Religion / Caste / Sub caste</td>
                  <td>{dashParts(m.religion_name || m.religion, m.caste_name || m.caste, m.subcaste)}</td>
                </tr>
                <tr>
                  <td>Gothra / Star / Rasi</td>
                  <td>{dashParts(m.gothra, m.star, m.moonsign)}</td>
                </tr>
                <tr>
                  <td>Education / Job</td>
                  <td>{joinParts(m.edu_name || m.edu_detail, m.ocp_name || m.occupation || m.emp_in)}</td>
                </tr>
                <tr>
                  <td>Income / Height / Complexion</td>
                  <td>{dashParts(m.income, m.height, m.complexion)}</td>
                </tr>
                <tr>
                  <td>Weight / Body Type</td>
                  <td>{dashParts(m.weight, m.bodytype)}</td>
                </tr>
                <tr>
                  <td>Mother Tongue / Diet</td>
                  <td>{joinParts(m.m_tongue, m.diet)}</td>
                </tr>
                <tr>
                  <td>Physical Status</td>
                  <td>{v(m.physicalStatus)}</td>
                </tr>
                <tr>
                  <td>Parents / Father Job / Mother Job</td>
                  <td>
                    {joinParts(m.father_name, m.father_occupation)} / {joinParts(m.mother_name, m.mother_occupation)}
                  </td>
                </tr>
                <tr>
                  <td>Email / Mobile</td>
                  <td>{hideContact ? 'Visible to paid members' : joinParts(m.email, mobile)}</td>
                </tr>
                <tr>
                  <td>Location</td>
                  <td>{v(location)}</td>
                </tr>
                <tr>
                  <td>Native / Native District</td>
                  <td>{v(m.family_origin)}</td>
                </tr>
                <tr>
                  <td>Manglik / Dosham</td>
                  <td>{v(m.manglik)}</td>
                </tr>
                <tr>
                  <td>About</td>
                  <td>{v(m.profile_text)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <div className="bd-photo-wrap">
              <div className="bd-site">
                <img src={logoSrc} alt={siteName} className="bd-site-logo" />
              </div>
              <img src={photo} alt="Profile" />
            </div>
          </div>
        </div>

        <h4 className="bd-section-title">Family Details</h4>
        <table className="bd-family">
          <thead>
            <tr>
              <th>Relationship</th>
              <th>Brothers</th>
              <th>Married Brothers</th>
              <th>Sisters</th>
              <th>Married Sisters</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Count</td>
              <td>{v(m.no_of_brothers, '0')}</td>
              <td>{v(m.no_marri_brother, '0')}</td>
              <td>{v(m.no_of_sisters, '0')}</td>
              <td>{v(m.no_marri_sister, '0')}</td>
            </tr>
          </tbody>
        </table>
        <table className="bd-kv" style={{ marginTop: 8 }}>
          <tbody>
            <tr>
              <td>Family Type / Status / Value</td>
              <td>{joinParts(m.family_type, m.family_status, m.family_value)}</td>
            </tr>
            <tr>
              <td>Family Origin / Native</td>
              <td>{v(m.family_origin)}</td>
            </tr>
          </tbody>
        </table>

        <h4 className="bd-section-title">Life Partner Expectations</h4>
        <table className="bd-kv">
          <tbody>
            <tr>
              <td>Age</td>
              <td>
                {v(m.part_frm_age)} to {v(m.part_to_age)} Years
              </td>
            </tr>
            <tr>
              <td>Height</td>
              <td>
                {v(m.part_height)} to {v(m.part_height_to)}
              </td>
            </tr>
            <tr>
              <td>Looking For</td>
              <td>{v(m.looking_for)}</td>
            </tr>
            <tr>
              <td>Education / Occupation</td>
              <td>{joinParts(m.part_edu, m.part_occu)}</td>
            </tr>
            <tr>
              <td>Religion / Caste</td>
              <td>{joinParts(m.part_religion, m.part_caste)}</td>
            </tr>
            <tr>
              <td>Country / State / City</td>
              <td>{joinParts(m.part_country_living, m.part_state, m.part_city)}</td>
            </tr>
            <tr>
              <td>Diet / Smoke / Drink</td>
              <td>{joinParts(m.part_diet, m.part_smoke, m.part_drink)}</td>
            </tr>
            <tr>
              <td>Any Other Expectation</td>
              <td>{v(m.part_expect)}</td>
            </tr>
          </tbody>
        </table>

        <h4 className="bd-section-title alt">Horoscope</h4>
        {canHoro ? (
          <>
            <table className="bd-kv">
              <tbody>
                <tr>
                  <td>Dasa Balance</td>
                  <td>{v(dasa)}</td>
                </tr>
                <tr>
                  <td>Star / Padham / Lagnam / Dosh</td>
                  <td>{joinParts(m.star, m.padham, m.lagnam, m.dosh || m.manglik)}</td>
                </tr>
                <tr>
                  <td>Birth Time Type</td>
                  <td>{v(m.birth_time_type, 'Exact')}</td>
                </tr>
                <tr>
                  <td>Horoscope Image</td>
                  <td>
                    {m.hor_photo ? (
                      <a href={horoUrl(m.hor_photo)} target="_blank" rel="noreferrer">
                        <img
                          src={horoUrl(m.hor_photo)}
                          alt="Horoscope"
                          style={{ maxWidth: 220, maxHeight: 220, border: '1px solid #ccc', display: 'block', marginBottom: 6 }}
                        />
                        View full image ({v(m.hor_check, 'PENDING')})
                      </a>
                    ) : (
                      'Not uploaded'
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="bd-charts">
              <div className="bd-chart-box">
                <h5>RASI</h5>
                <div className="bd-chart-grid">{chartCells(m, 'rasi')}</div>
              </div>
              <div className="bd-chart-box">
                <h5>AMSAM</h5>
                <div className="bd-chart-grid">{chartCells(m, 'amsam')}</div>
              </div>
            </div>
          </>
        ) : (
          <p style={{ padding: 12, color: '#666' }}>Full horoscope is available for paid members.</p>
        )}

        {mode !== 'public' ? (
          <>
            <h4 className="bd-section-title blue">Documents</h4>
            <table className="bd-kv">
              <tbody>
                <tr>
                  <td>Aadhaar / ID Document</td>
                  <td>
                    {m.aadhaar_card ? (
                      <a href={docUrl(m.aadhaar_card)} target="_blank" rel="noreferrer">
                        {/\.(jpe?g|png|webp)$/i.test(String(m.aadhaar_card)) ? (
                          <img
                            src={docUrl(m.aadhaar_card)}
                            alt="Aadhaar"
                            style={{ maxWidth: 180, maxHeight: 180, border: '1px solid #ccc', display: 'block', marginBottom: 6 }}
                          />
                        ) : null}
                        View document ({v(m.aadhaar_card_status, 'PENDING')})
                      </a>
                    ) : (
                      'Not uploaded'
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        ) : null}
      </div>
    </div>
  )
}
