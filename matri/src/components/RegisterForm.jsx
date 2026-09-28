import { useMemo, useState } from 'react'
import {
  BookOpen,
  CalendarDays,
  Globe2,
  Mail,
  Pencil,
  Phone,
  User,
  Users,
} from 'lucide-react'
import { useAuth } from '../auth'
import PasswordInput from './PasswordInput'
import '../pages/Auth.css'

const PROFILE_CREATED_BY = ['Self', 'Parents', 'Sibling', 'Relative', 'Friend']
const GENDERS = ['Male', 'Female']
const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist', 'Other']
const CASTE_BY_RELIGION = {
  Hindu: ['Brahmin', 'Kshatriya', 'Vaishya', 'Kayastha', 'Other'],
  Muslim: ['Sunni', 'Shia', 'Other'],
  Christian: ['Catholic', 'Protestant', 'Orthodox', 'Other'],
  Sikh: ['Jat', 'Khatri', 'Ramgarhia', 'Other'],
  Jain: ['Digambar', 'Shwetambar', 'Other'],
  Buddhist: ['Theravada', 'Mahayana', 'Other'],
  Other: ['Other'],
}
const MOTHER_TONGUES = [
  'Hindi',
  'English',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Gujarati',
  'Bengali',
  'Punjabi',
  'Urdu',
  'Odia',
]
const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Australia', 'UAE', 'Other']
const COUNTRY_CODES = ['+91', '+1', '+44', '+61', '+971']

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const YEARS = Array.from({ length: 60 }, (_, i) => String(new Date().getFullYear() - 18 - i))

const INITIAL = {
  createdBy: '',
  gender: '',
  firstName: '',
  lastName: '',
  day: '01',
  month: '',
  year: '',
  religion: '',
  caste: '',
  motherTongue: '',
  country: '',
  countryCode: '+91',
  phone: '',
  address: '',
  email: '',
  terms: false,
}

function FieldIcon({ icon: Icon }) {
  return (
    <span className="auth-icon" aria-hidden="true">
      <Icon size={15} strokeWidth={2} />
    </span>
  )
}

export default function RegisterForm({ onNavigate, onSuccess, className = '' }) {
  const { register } = useAuth()
  const [form, setForm] = useState(INITIAL)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [password, setPassword] = useState('')

  const casteOptions = useMemo(
    () => (form.religion ? CASTE_BY_RELIGION[form.religion] || [] : []),
    [form.religion],
  )

  function update(name) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
      setForm((prev) => {
        const next = { ...prev, [name]: value }
        if (name === 'religion') next.caste = ''
        return next
      })
    }
  }

  return (
    <form
      className={`page-card page-card--static auth-card auth-card--register ${className}`.trim()}
      onSubmit={async (e) => {
        e.preventDefault()
        setBusy(true)
        setError('')
        try {
          await register({
            ...form,
            password: password || undefined,
            phone: form.phone,
            firstName: form.firstName,
            lastName: form.lastName,
            createdBy: form.createdBy,
            motherTongue: form.motherTongue,
            countryCode: form.countryCode,
          })
          onSuccess?.()
          onNavigate?.('dashboard')
        } catch (err) {
          setError(err.message || 'Registration failed')
        } finally {
          setBusy(false)
        }
      }}
    >
      <h2 className="auth-card__script-title">Find Your Life Partner</h2>
      {error ? <p style={{ color: '#b42318', marginBottom: 12, fontSize: 14 }}>{error}</p> : null}

      <div className="auth-grid">
        <div className="auth-input">
          <FieldIcon icon={Users} />
          <select name="createdBy" value={form.createdBy} onChange={update('createdBy')} required>
            <option value="" disabled>
              Profile Created By
            </option>
            {PROFILE_CREATED_BY.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="auth-input">
          <select name="gender" value={form.gender} onChange={update('gender')} required>
            <option value="" disabled>
              Select Gender
            </option>
            {GENDERS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="auth-input">
          <FieldIcon icon={User} />
          <input
            type="text"
            name="firstName"
            placeholder="Enter First Name"
            value={form.firstName}
            onChange={update('firstName')}
            required
          />
        </div>

        <div className="auth-input">
          <input
            type="text"
            name="lastName"
            placeholder="Enter Last Name"
            value={form.lastName}
            onChange={update('lastName')}
            required
          />
        </div>

        <div className="auth-dob auth-grid--full">
          <FieldIcon icon={CalendarDays} />
          <div className="auth-dob__fields">
            <select name="day" value={form.day} onChange={update('day')} required>
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <select name="month" value={form.month} onChange={update('month')} required>
              <option value="" disabled>
                Month
              </option>
              {MONTHS.map((month, index) => (
                <option key={month} value={String(index + 1).padStart(2, '0')}>
                  {month}
                </option>
              ))}
            </select>
            <select name="year" value={form.year} onChange={update('year')} required>
              <option value="" disabled>
                Year
              </option>
              {YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="auth-input auth-grid--full">
          <FieldIcon icon={BookOpen} />
          <select name="religion" value={form.religion} onChange={update('religion')} required>
            <option value="" disabled>
              Select Your Religion
            </option>
            {RELIGIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="auth-input auth-grid--full">
          <FieldIcon icon={Users} />
          <select
            name="caste"
            value={form.caste}
            onChange={update('caste')}
            required
            disabled={!form.religion}
          >
            <option value="" disabled>
              {form.religion ? 'Select Caste / Community' : 'Select Religion First'}
            </option>
            {casteOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="auth-input">
          <FieldIcon icon={Globe2} />
          <select
            name="motherTongue"
            value={form.motherTongue}
            onChange={update('motherTongue')}
            required
          >
            <option value="" disabled>
              Mother Tongue
            </option>
            {MOTHER_TONGUES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="auth-input">
          <select name="country" value={form.country} onChange={update('country')} required>
            <option value="" disabled>
              Country
            </option>
            {COUNTRIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="auth-phone auth-grid--full">
          <FieldIcon icon={Phone} />
          <select
            name="countryCode"
            value={form.countryCode}
            onChange={update('countryCode')}
            required
          >
            {COUNTRY_CODES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
          <input
            type="tel"
            name="phone"
            placeholder="Enter Your 10 Digit No"
            value={form.phone}
            onChange={update('phone')}
            pattern="[0-9]{10}"
            maxLength={10}
            required
          />
        </div>

        <div className="auth-input auth-grid--full">
          <textarea
            name="address"
            placeholder="Enter your address"
            value={form.address}
            onChange={update('address')}
            rows={3}
            required
          />
        </div>

        <div className="auth-input auth-grid--full">
          <FieldIcon icon={Mail} />
          <input
            type="email"
            name="email"
            placeholder="Enter Your Email Id"
            value={form.email}
            onChange={update('email')}
            required
          />
        </div>

        <div className="auth-input auth-grid--full">
          <PasswordInput
            name="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
            autoComplete="new-password"
          />
        </div>
      </div>

      <label className="auth-card__check auth-card__check--block">
        <input type="checkbox" name="terms" checked={form.terms} onChange={update('terms')} required />
        <span>
          I accept{' '}
          <button type="button" className="auth-card__link" onClick={() => onNavigate?.('terms')}>
            terms &amp; conditions
          </button>{' '}
          and{' '}
          <button type="button" className="auth-card__link" onClick={() => onNavigate?.('privacy')}>
            privacy policy
          </button>
          .
        </span>
      </label>

      <button type="submit" className="btn btn-primary auth-card__submit auth-card__submit--register" disabled={busy}>
        <span className="auth-card__submit-icon" aria-hidden="true">
          <Pencil size={15} strokeWidth={2} />
        </span>
        {busy ? 'Registering…' : 'Register Now'}
      </button>

      <p className="auth-card__footer">
        Already have an account?{' '}
        <button type="button" className="auth-card__link" onClick={() => onNavigate?.('login')}>
          Login
        </button>
      </p>
    </form>
  )
}
