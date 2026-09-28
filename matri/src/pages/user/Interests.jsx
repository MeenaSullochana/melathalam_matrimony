import { useEffect, useState } from 'react'
import { Check, X, Send, Inbox, Heart, Trash2 } from 'lucide-react'
import { api, photoUrl } from '../../api'
import { useAuth } from '../../auth'
import './user-pages.css'

function mapItem(row, side) {
  const name = row.username || `${row.firstname || ''} ${row.lastname || ''}`.trim() || row.profile_id || 'Member'
  const status =
    row.receiver_response === 'Accept'
      ? 'Matched'
      : row.receiver_response === 'Reject'
        ? 'Not interested'
        : 'Pending'
  return {
    id: row.ei_id,
    name,
    detail: side === 'received' ? `From ${row.ei_sender}` : `To ${row.ei_receiver}`,
    matriId: side === 'received' ? row.ei_sender : row.ei_receiver,
    status,
    raw: row.receiver_response,
    photo: photoUrl(row.photo1, row.gender),
    message: row.ei_message || '',
  }
}

export default function Interests() {
  const { token } = useAuth()
  const [tab, setTab] = useState('received')
  const [filter, setFilter] = useState('all')
  const [received, setReceived] = useState([])
  const [sent, setSent] = useState([])
  const [matched, setMatched] = useState([])
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  async function load() {
    try {
      const data = await api('/api/member/interests', { token })
      setReceived((data.received || []).map((r) => mapItem(r, 'received')))
      setSent((data.sent || []).map((r) => mapItem(r, 'sent')))
      setMatched((data.matched || []).map((r) => mapItem(r, r.ei_receiver ? 'sent' : 'received')))
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => {
    load()
  }, [token])

  const respond = async (id, action) => {
    setMsg('')
    try {
      const res = await api(`/api/member/interests/${id}/respond`, {
        method: 'POST',
        token,
        body: { action },
      })
      setMsg(res.message || 'Updated')
      load()
    } catch (e) {
      setMsg(e.message)
    }
  }

  const trash = async (id) => {
    await api(`/api/member/interests/${id}/trash`, { method: 'POST', token })
    load()
  }

  let list = tab === 'sent' ? sent : tab === 'matched' ? matched : received
  if (filter === 'pending') list = list.filter((i) => i.raw === 'Pending')
  if (filter === 'accept') list = list.filter((i) => i.raw === 'Accept')
  if (filter === 'reject') list = list.filter((i) => i.raw === 'Reject')

  return (
    <div className="user-page">
      <section className="user-panel">
        <div className="user-panel__head">
          <div>
            <h2 className="user-panel__title">Interests</h2>
            <p className="user-panel__sub">
              Express interest after viewing a profile. Accept = mutual match. Decline = Not interested.
            </p>
          </div>
        </div>
        {error ? <p style={{ color: '#b42318' }}>{error}</p> : null}
        {msg ? <p style={{ color: '#0f766e' }}>{msg}</p> : null}

        <div className="user-tabs" role="tablist">
          {[
            { id: 'received', label: 'Received', icon: Inbox },
            { id: 'sent', label: 'Sent', icon: Send },
            { id: 'matched', label: 'Mutual matches', icon: Heart },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`user-tabs__btn ${tab === id ? 'is-active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {[
            ['all', 'All'],
            ['pending', 'Pending'],
            ['accept', 'Accepted'],
            ['reject', 'Not interested'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`btn ${filter === id ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '4px 10px', fontSize: 13 }}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <ul className="interest-list">
          {list.map((item) => (
            <li key={`${tab}-${item.id}`} className="interest-item">
              <div className="interest-item__top">
                <img
                  src={item.photo}
                  alt=""
                  className="interest-item__avatar"
                  style={{ objectFit: 'cover', width: 48, height: 48, borderRadius: '50%' }}
                />
                <div className="interest-item__body">
                  <p className="interest-item__name">{item.name}</p>
                  <p className="interest-item__detail">
                    {item.detail} · {item.matriId}
                  </p>
                  {item.message ? <p className="user-panel__sub">{item.message}</p> : null}
                </div>
              </div>
              <div className="interest-item__footer">
                <span className={`interest-item__status interest-item__status--${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {item.status}
                </span>
                {tab === 'received' && item.raw === 'Pending' && (
                  <div className="interest-item__actions">
                    <button type="button" className="btn btn-primary interest-item__btn" onClick={() => respond(item.id, 'accept')} title="Accept / Mutual">
                      <Check size={15} />
                    </button>
                    <button type="button" className="btn btn-outline interest-item__btn" onClick={() => respond(item.id, 'reject')} title="Not interested">
                      <X size={15} />
                    </button>
                  </div>
                )}
                <button type="button" className="btn btn-outline interest-item__btn" onClick={() => trash(item.id)} title="Trash">
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
          {!list.length ? <li className="muted" style={{ padding: 16 }}>No interests in this list.</li> : null}
        </ul>
      </section>
    </div>
  )
}
