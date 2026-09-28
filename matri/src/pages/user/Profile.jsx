import { useEffect, useRef, useState } from 'react'
import {
  Pencil,
  Save,
  Camera,
  User,
  Users,
  Heart,
  Star,
  FileText,
  Upload,
  ShieldCheck,
  Eye,
  X,
  Download,
  Printer,
} from 'lucide-react'
import {
  PROFILE_CREATED_BY,
  GENDERS,
  MARITAL_STATUS,
  MANGlik_OPTIONS,
  CONTACT_PREFERENCE,
  FAMILY_TYPE,
  FAMILY_STATUS,
  HOROSCOPE_PREFERENCE,
  INCOME_PREFERENCE,
  RASI_OPTIONS,
  NAKSHATRA_OPTIONS,
  PADA_OPTIONS,
  DOSHAM_OPTIONS,
  VERIFICATION_STATUS,
} from '../../constants/profileOptions'
import { api, photoUrl } from '../../api'
import { useAuth } from '../../auth'
import MemberProfileSheet from '../../components/MemberProfileSheet'
import HoroscopeChartsEditor, { emptyHoroscopeHouses, pickHoroscopeHouses } from '../../components/HoroscopeChartsEditor'
import './user-pages.css'

/** DB may store DOB as 1/29/1999 — date inputs need yyyy-mm-dd */
function toDateInputValue(raw) {
  if (raw == null || raw === '') return ''
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw.toISOString().slice(0, 10)
  const s = String(raw).trim()
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (us) {
    const month = Number(us[1])
    const day = Number(us[2])
    const y = us[3]
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }
  const dmy = s.match(/^(\d{1,2})[-.](\d{1,2})[-.](\d{4})$/)
  if (dmy) {
    const day = Number(dmy[1])
    const month = Number(dmy[2])
    const y = dmy[3]
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }
  const parsed = new Date(s)
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
  return ''
}

const TABS = [
  { id: 'biodata', label: 'Biodata', icon: User },
  { id: 'family', label: 'Family Details', icon: Users },
  { id: 'partner', label: 'Partner Expectations', icon: Heart },
  { id: 'horoscope', label: 'Horoscope', icon: Star },
  { id: 'documents', label: 'Documents', icon: FileText },
]

const emptyForm = () => ({
  profileId: '',
  profileCreatedBy: 'Self',
  fullName: '',
  gender: '',
  dateOfBirth: '',
  age: '',
  placeOfBirth: '',
  timeOfBirth: '',
  height: '',
  weight: '',
  maritalStatus: '',
  motherTongue: '',
  religion: '',
  caste: '',
  subCaste: '',
  gothram: '',
  starNakshatra: '',
  rasi: '',
  lagnam: '',
  manglik: '',
  education: '',
  qualification: '',
  occupation: '',
  companyName: '',
  workLocation: '',
  income: '',
  contactPreference: '',
  diet: '',
  complexion: '',
  bodytype: '',
  physicalStatus: '',
  fathersName: '',
  fathersOccupation: '',
  mothersName: '',
  mothersOccupation: '',
  numberOfBrothers: '',
  numberOfSisters: '',
  brothersMaritalStatus: '',
  sistersMaritalStatus: '',
  familyType: '',
  familyStatus: '',
  nativePlace: '',
  currentResidence: '',
  aboutFamily: '',
  preferredAge: '',
  preferredAgeFrom: '',
  preferredAgeTo: '',
  preferredHeight: '',
  preferredHeightTo: '',
  preferredMaritalStatus: '',
  preferredReligion: '',
  preferredCaste: '',
  preferredSubCaste: '',
  preferredMotherTongue: '',
  preferredEducation: '',
  preferredOccupation: '',
  preferredLocation: '',
  incomePreference: '',
  foodPreference: '',
  horoscopePreference: '',
  otherExpectations: '',
  horoscopePada: '',
  chevvaiDosham: '',
  rahuKetuDosham: '',
  horoscopeChart: '',
  navamsamChart: '',
  profilePhoto: '',
  horoscopeDocument: '',
  aadhaarProof: '',
  educationCertificate: '',
  incomeProof: '',
  otherDocuments: '',
  documentVerificationStatus: '',
  aboutMe: '',
  educationCareer: '',
  hobbiesInterests: '',
  lifestyle: '',
  phone: '',
  email: '',
  whatsapp: '',
  address: '',
  partnerPreferences: '',
  profileVerification: '',
  photoGallery: '',
  ...emptyHoroscopeHouses(),
})

function Field({ label, name, type = 'text', options, span, editing, form, update, readOnly }) {
  const value = form[name] ?? ''
  const disabled = !editing || readOnly
  const opts = (options || []).map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : { value: String(opt.value), label: opt.label || opt.value },
  )

  if (type === 'select') {
    return (
      <label className={`user-field ${span ? 'user-form-grid--full' : ''}`}>
        <span>{label}</span>
        <select value={value} onChange={update(name)} disabled={disabled}>
          <option value="">Select</option>
          {opts.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    )
  }

  if (type === 'textarea') {
    return (
      <label className="user-field user-form-grid--full">
        <span>{label}</span>
        <textarea value={value} onChange={update(name)} disabled={disabled} rows={4} />
      </label>
    )
  }

  return (
    <label className={`user-field ${span ? 'user-form-grid--full' : ''}`}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={update(name)}
        disabled={disabled}
        readOnly={readOnly}
      />
    </label>
  )
}

function isPreviewableFile(name, mimeType) {
  if (mimeType?.startsWith('image/') || mimeType === 'application/pdf') return true
  return /\.(pdf|jpg|jpeg|png|gif|webp)$/i.test(name || '')
}

function FilePreviewModal({ file, onClose }) {
  if (!file) return null

  const isPdf =
    file.mimeType === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf')
  const isImage =
    file.mimeType?.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name || '')

  return (
    <div className="profile-preview-overlay" onClick={onClose} role="presentation">
      <div
        className="profile-preview-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-preview-title"
      >
        <div className="profile-preview-modal__head">
          <h3 id="profile-preview-title">{file.name}</h3>
          <button type="button" className="profile-preview-modal__close" onClick={onClose} aria-label="Close preview">
            <X size={18} />
          </button>
        </div>
        <div className="profile-preview-modal__body">
          {isPdf && (
            <iframe src={file.url} title={file.name} className="profile-preview-modal__pdf" />
          )}
          {isImage && (
            <img src={file.url} alt={file.name} className="profile-preview-modal__image" />
          )}
          {!isPdf && !isImage && (
            <p className="profile-preview-modal__fallback">
              Preview is not available for this file type.
            </p>
          )}
        </div>
        <div className="profile-preview-modal__foot">
          <a href={file.url} download={file.name} className="btn btn-outline">
            <Download size={15} />
            Download
          </a>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function FileField({ label, name, editing, form, updateFile, filePreview, onPreview, accept }) {
  const value = form[name]
  const hasFile = Boolean(value)
  const canPreview = filePreview && isPreviewableFile(filePreview.name, filePreview.mimeType)

  return (
    <div className="user-field">
      <span>{label}</span>
      {editing ? (
        <div className="profile-file-row">
          <div className="profile-upload">
            <Upload size={15} />
            <input type="file" accept={accept} onChange={updateFile(name)} />
            <span>{hasFile ? 'Replace file' : 'Choose file'}</span>
          </div>
          {hasFile && (
            <div className="profile-file-row__meta">
              <span className="profile-file-row__name">{value}</span>
              {canPreview && (
                <button
                  type="button"
                  className="btn btn-outline profile-file-row__preview"
                  onClick={() => onPreview(name)}
                >
                  <Eye size={14} />
                  Preview
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className={`profile-file-row ${!hasFile ? 'profile-file-row--empty' : ''}`}>
          <span className="profile-file-row__name">{hasFile ? value : 'Not uploaded'}</span>
          {canPreview && (
            <button
              type="button"
              className="btn btn-outline profile-file-row__preview"
              onClick={() => onPreview(name)}
            >
              <Eye size={14} />
              Preview
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function getInitials(name) {
  return (name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')
}

function ProfileHeroPhoto({ editing, fullName, filePreview, onUpload, onPreview }) {
  const inputRef = useRef(null)
  const initials = getInitials(fullName) || 'U'
  const hasPhoto = Boolean(filePreview?.url)

  return (
    <div className="profile-hero__photo">
      {hasPhoto ? (
        <button
          type="button"
          className="profile-hero__photo-btn"
          onClick={() => onPreview(filePreview)}
          aria-label="Preview profile photo"
        >
          <img src={filePreview.url} alt={fullName} className="profile-hero__photo-img" />
        </button>
      ) : (
        <span className="profile-hero__initials">{initials}</span>
      )}
      {editing ? (
        <>
          <button
            type="button"
            className="profile-hero__camera"
            onClick={() => inputRef.current?.click()}
            aria-label="Upload profile photo"
          >
            <Camera size={16} />
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onUpload}
          />
        </>
      ) : (
        hasPhoto && (
          <button
            type="button"
            className="profile-hero__camera profile-hero__camera--preview"
            onClick={() => onPreview(filePreview)}
            aria-label="Preview profile photo"
          >
            <Eye size={14} />
          </button>
        )
      )}
    </div>
  )
}

function PhotoGallery({ editing, gallery, onUpload, onPreview, onRemove }) {
  const countLabel =
    gallery.length === 0
      ? 'No photos uploaded'
      : `${gallery.length} photo${gallery.length === 1 ? '' : 's'} uploaded`

  return (
    <div className="profile-gallery user-form-grid--full">
      <div className="profile-gallery__grid">
        {gallery.map((photo) => (
          <div key={photo.id} className="profile-gallery__item">
            <button
              type="button"
              className="profile-gallery__thumb"
              onClick={() => onPreview(photo)}
              aria-label={`Preview ${photo.name}`}
            >
              <img src={photo.url} alt={photo.name} />
            </button>
            {editing && (
              <button
                type="button"
                className="profile-gallery__remove"
                onClick={() => onRemove(photo.id)}
                aria-label={`Remove ${photo.name}`}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        {editing && (
          <label className="profile-gallery__upload">
            <Upload size={18} />
            <span>Add photos</span>
            <input type="file" multiple accept="image/*" onChange={onUpload} />
          </label>
        )}
      </div>
      <p className="profile-gallery__count">{countLabel}</p>
    </div>
  )
}

function SubSection({ title, children, fullWidth }) {
  return (
    <div className="profile-subsection">
      <h4 className="profile-subsection__title">{title}</h4>
      {fullWidth ? children : <div className="user-form-grid">{children}</div>}
    </div>
  )
}

export default function Profile() {
  const { token, member, refresh } = useAuth()
  const [editing, setEditing] = useState(false)
  const [mode, setMode] = useState('edit') // 'edit' | 'view' | 'print'
  const [tab, setTab] = useState('biodata')
  const [form, setForm] = useState(emptyForm)
  const [masters, setMasters] = useState({
    religions: [],
    castes: [],
    tongues: [],
    educations: [],
    occupations: [],
    heights: [],
    weights: [],
    diets: [],
    complexions: [],
    bodyTypes: [],
  })
  const [filePreviews, setFilePreviews] = useState({})
  const [galleryPhotos, setGalleryPhotos] = useState([])
  const [activePreview, setActivePreview] = useState(null)
  const [saveMsg, setSaveMsg] = useState('')
  const filePreviewsRef = useRef(filePreviews)
  const galleryRef = useRef(galleryPhotos)

  filePreviewsRef.current = filePreviews
  galleryRef.current = galleryPhotos

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [religions, tongues, educations, occupations, heights, weights, diets, complexions, bodyTypes] =
          await Promise.all([
            api('/api/public/master/religions'),
            api('/api/public/master/mother-tongues'),
            api('/api/public/master/education'),
            api('/api/public/master/occupations'),
            api('/api/public/master/heights'),
            api('/api/public/master/weights'),
            api('/api/public/master/diets'),
            api('/api/public/master/complexions'),
            api('/api/public/master/body-types'),
          ])
        if (cancelled) return
        setMasters((m) => ({
          ...m,
          religions: religions.items || [],
          tongues: tongues.items || [],
          educations: educations.items || [],
          occupations: occupations.items || [],
          heights: heights.items || [],
          weights: weights.items || [],
          diets: diets.items || [],
          complexions: complexions.items || [],
          bodyTypes: bodyTypes.items || [],
        }))
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!form.religion) {
      setMasters((m) => ({ ...m, castes: [] }))
      return
    }
    const rel = masters.religions.find((r) => r.name === form.religion)
    const rid = rel?.id ?? rel?.legacy_id
    if (!rid) return
    api(`/api/public/master/caste?religion_id=${encodeURIComponent(rid)}`)
      .then((r) => setMasters((m) => ({ ...m, castes: r.items || [] })))
      .catch(() => setMasters((m) => ({ ...m, castes: [] })))
  }, [form.religion, masters.religions])

  useEffect(() => {
    if (!member) {
      setForm(emptyForm())
      return
    }
    setForm({
      ...emptyForm(),
      profileId: member.matri_id || '',
      profileCreatedBy: member.profileby || 'Self',
      fullName: member.username || `${member.firstname || ''} ${member.lastname || ''}`.trim() || '',
      gender: member.gender || '',
      dateOfBirth: toDateInputValue(member.birthdate || member.birth_date || member.dob) || '',
      age: member.age != null ? String(member.age) : '',
      placeOfBirth: member.birthplace || '',
      timeOfBirth: member.birthtime || '',
      height: member.height || '',
      weight: member.weight || '',
      maritalStatus: member.m_status || '',
      motherTongue: member.m_tongue || '',
      religion: member.religion_name || member.religion || '',
      caste: member.caste_name || member.caste || '',
      subCaste: member.subcaste || '',
      gothram: member.gothra || '',
      starNakshatra: member.star || '',
      rasi: member.moonsign || '',
      lagnam: member.lagnam || '',
      manglik: member.manglik || '',
      education: member.edu_detail || '',
      occupation: member.occupation || member.emp_in || '',
      companyName: member.emp_in || '',
      income: member.income || '',
      diet: member.diet || '',
      complexion: member.complexion || '',
      bodytype: member.bodytype || '',
      physicalStatus: member.physicalStatus || '',
      fathersName: member.father_name || '',
      mothersName: member.mother_name || '',
      fathersOccupation: member.father_occupation || '',
      mothersOccupation: member.mother_occupation || '',
      numberOfBrothers: member.no_of_brothers != null ? String(member.no_of_brothers) : '',
      numberOfSisters: member.no_of_sisters != null ? String(member.no_of_sisters) : '',
      brothersMaritalStatus: member.no_marri_brother != null ? String(member.no_marri_brother) : '',
      sistersMaritalStatus: member.no_marri_sister != null ? String(member.no_marri_sister) : '',
      familyType: member.family_type || '',
      familyStatus: member.family_status || '',
      nativePlace: member.family_origin || '',
      aboutMe: member.profile_text || '',
      preferredAge: [member.part_frm_age, member.part_to_age].filter(Boolean).join(' – '),
      preferredAgeFrom: member.part_frm_age != null ? String(member.part_frm_age) : '',
      preferredAgeTo: member.part_to_age != null ? String(member.part_to_age) : '',
      preferredHeight: member.part_height || '',
      preferredHeightTo: member.part_height_to || '',
      preferredReligion: member.part_religion || '',
      preferredCaste: member.part_caste || '',
      preferredMotherTongue: member.part_mtongue || '',
      preferredEducation: member.part_edu || '',
      preferredOccupation: member.part_occu || '',
      incomePreference: member.part_income || '',
      foodPreference: member.part_diet || '',
      otherExpectations: member.part_expect || '',
      phone: [member.mobile_code, member.mobile].filter(Boolean).join(' ') || member.mobile || '',
      email: member.email || '',
      address: member.address || '',
      aadhaarProof: member.aadhaar_card || '',
      profilePhoto: member.photo1 || '',
      horoscopeDocument: member.hor_photo || '',
      horoscopePada: member.padham || '',
      ...pickHoroscopeHouses(member),
    })
  }, [member])

  useEffect(() => {
    return () => {
      Object.values(filePreviewsRef.current).forEach((file) => {
        if (file?.url) URL.revokeObjectURL(file.url)
      })
      galleryRef.current.forEach((photo) => {
        if (photo?.url) URL.revokeObjectURL(photo.url)
      })
    }
  }, [])

  useEffect(() => {
    if (mode === 'print') {
      const t = setTimeout(() => window.print(), 400)
      return () => clearTimeout(t)
    }
  }, [mode])

  const nameOpts = (list) => (list || []).map((i) => ({ value: i.name, label: i.name }))

  const update = (key) => (e) => {
    setForm((prev) => {
      const next = { ...prev, [key]: e.target.value }
      if (key === 'religion') next.caste = ''
      if (key === 'preferredReligion') next.preferredCaste = ''
      return next
    })
  }

  const storeFilePreview = (key, file) => {
    setForm((prev) => ({ ...prev, [key]: file.name }))
    setFilePreviews((prev) => {
      if (prev[key]?.url) URL.revokeObjectURL(prev[key].url)
      return {
        ...prev,
        [key]: {
          name: file.name,
          url: URL.createObjectURL(file),
          mimeType: file.type,
        },
      }
    })
  }

  const updateFile = (key) => (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    storeFilePreview(key, file)
  }

  const updateProfilePhoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    storeFilePreview('profilePhoto', file)
  }

  const updateGallery = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const newPhotos = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      url: URL.createObjectURL(file),
      mimeType: file.type,
    }))

    setGalleryPhotos((prev) => {
      const next = [...prev, ...newPhotos]
      setForm((formPrev) => ({
        ...formPrev,
        photoGallery: `${next.length} photo${next.length === 1 ? '' : 's'} uploaded`,
      }))
      return next
    })

    e.target.value = ''
  }

  const removeGalleryPhoto = (id) => {
    setGalleryPhotos((prev) => {
      const photo = prev.find((item) => item.id === id)
      if (photo?.url) URL.revokeObjectURL(photo.url)
      const next = prev.filter((item) => item.id !== id)
      setForm((formPrev) => ({
        ...formPrev,
        photoGallery: next.length
          ? `${next.length} photo${next.length === 1 ? '' : 's'} uploaded`
          : '',
      }))
      return next
    })
  }

  const openPreview = (keyOrPhoto) => {
    if (typeof keyOrPhoto === 'string') {
      setActivePreview(filePreviews[keyOrPhoto] || null)
      return
    }
    setActivePreview(keyOrPhoto || null)
  }

  const save = async (e) => {
    e.preventDefault()
    setSaveMsg('')
    try {
      const [firstname, ...rest] = String(form.fullName || '').trim().split(/\s+/)
      await api('/api/auth/me', {
        method: 'PUT',
        token,
        body: {
          username: form.fullName,
          firstname: firstname || form.fullName,
          lastname: rest.join(' '),
          gender: form.gender,
          birthdate: form.dateOfBirth,
          age: form.age,
          birthplace: form.placeOfBirth,
          birthtime: form.timeOfBirth,
          height: form.height,
          weight: form.weight,
          m_status: form.maritalStatus,
          profileby: form.profileCreatedBy,
          m_tongue: form.motherTongue,
          religion: form.religion,
          caste: form.caste,
          subcaste: form.subCaste,
          edu_detail: form.education,
          occupation: form.occupation,
          emp_in: form.companyName || form.occupation,
          income: form.income,
          diet: form.diet,
          complexion: form.complexion,
          bodytype: form.bodytype,
          physicalStatus: form.physicalStatus,
          father_name: form.fathersName,
          mother_name: form.mothersName,
          father_occupation: form.fathersOccupation,
          mother_occupation: form.mothersOccupation,
          no_of_brothers: form.numberOfBrothers,
          no_of_sisters: form.numberOfSisters,
          no_marri_brother: form.brothersMaritalStatus,
          no_marri_sister: form.sistersMaritalStatus,
          family_type: form.familyType,
          family_status: form.familyStatus,
          family_origin: form.nativePlace,
          profile_text: form.aboutMe,
          part_height: form.preferredHeight,
          part_height_to: form.preferredHeightTo,
          part_religion: form.preferredReligion,
          part_caste: form.preferredCaste,
          part_mtongue: form.preferredMotherTongue,
          part_edu: form.preferredEducation,
          part_occu: form.preferredOccupation,
          part_income: form.incomePreference,
          part_diet: form.foodPreference,
          part_expect: form.otherExpectations || form.partnerPreferences,
          looking_for: form.preferredMaritalStatus,
          part_frm_age: form.preferredAgeFrom || String(form.preferredAge || '').split(/[–-]/)[0]?.trim() || '',
          part_to_age: form.preferredAgeTo || String(form.preferredAge || '').split(/[–-]/)[1]?.trim() || '',
          manglik: form.manglik,
          gothra: form.gothram,
          star: form.starNakshatra,
          moonsign: form.rasi,
          lagnam: form.lagnam,
          padham: form.horoscopePada,
          address: form.address,
          ...pickHoroscopeHouses(form),
        },
      })
      await refresh()
      setSaveMsg('Profile saved')
      setEditing(false)
    } catch (err) {
      setSaveMsg(err.message || 'Save failed')
    }
  }

  const props = { editing, form, update }
  const fileProps = {
    editing,
    form,
    updateFile,
    filePreviews,
    onPreview: openPreview,
    accept: '.pdf,image/*',
  }

  const sheetMember = {
    ...(member || {}),
    matri_id: form.profileId || member?.matri_id,
    firstname: form.fullName?.split(/\s+/)[0] || member?.firstname,
    lastname: form.fullName?.split(/\s+/).slice(1).join(' ') || member?.lastname,
    gender: form.gender,
    birthdate: form.dateOfBirth,
    birthtime: form.timeOfBirth,
    birthplace: form.placeOfBirth,
    height: form.height,
    weight: form.weight,
    m_status: form.maritalStatus,
    m_tongue: form.motherTongue,
    religion: form.religion,
    caste: form.caste,
    subcaste: form.subCaste,
    gothra: form.gothram,
    star: form.starNakshatra,
    moonsign: form.rasi,
    lagnam: form.lagnam,
    manglik: form.manglik,
    edu_detail: form.education,
    occupation: form.occupation,
    income: form.income,
    diet: form.diet,
    complexion: form.complexion,
    bodytype: form.bodytype,
    physicalStatus: form.physicalStatus,
    father_name: form.fathersName,
    mother_name: form.mothersName,
    father_occupation: form.fathersOccupation,
    mother_occupation: form.mothersOccupation,
    no_of_brothers: form.numberOfBrothers,
    no_of_sisters: form.numberOfSisters,
    no_marri_brother: form.brothersMaritalStatus,
    no_marri_sister: form.sistersMaritalStatus,
    family_type: form.familyType,
    family_status: form.familyStatus,
    family_origin: form.nativePlace,
    profile_text: form.aboutMe,
    part_height: form.preferredHeight,
    part_height_to: form.preferredHeightTo,
    part_religion: form.preferredReligion,
    part_caste: form.preferredCaste,
    part_edu: form.preferredEducation,
    part_occu: form.preferredOccupation,
    part_diet: form.foodPreference,
    part_expect: form.otherExpectations,
    email: form.email || member?.email,
    mobile: form.phone || member?.mobile,
    address: form.address,
    photo1: member?.photo1,
    hor_photo: member?.hor_photo,
    aadhaar_card: form.aadhaarProof || member?.aadhaar_card,
    padham: form.horoscopePada,
    ...pickHoroscopeHouses(form),
  }

  if (mode === 'view' || mode === 'print') {
    return (
      <div className="user-page">
        <div className="user-panel no-print" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <button type="button" className="btn btn-outline" onClick={() => setMode('edit')}>
            Back to edit
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setMode('print')}>
            <Printer size={15} /> Print / PDF
          </button>
          {mode === 'print' ? (
            <button type="button" className="btn btn-outline" onClick={() => window.print()}>
              Print now
            </button>
          ) : null}
        </div>
        <MemberProfileSheet
          member={sheetMember}
          mode="user"
          printOnly={mode === 'print'}
          onEdit={() => setMode('edit')}
          onPrint={() => setMode('print')}
        />
      </div>
    )
  }

  return (
    <div className="user-page">
      {saveMsg ? <p style={{ marginBottom: 12 }}>{saveMsg}</p> : null}
      <section className="user-panel profile-hero">
        <div className="profile-hero__main">
          <ProfileHeroPhoto
            editing={editing}
            fullName={form.fullName || 'Member'}
            filePreview={filePreviews.profilePhoto || (member?.photo1 ? { url: photoUrl(member.photo1), name: member.photo1, mimeType: 'image/*' } : null)}
            onUpload={updateProfilePhoto}
            onPreview={openPreview}
          />
          <div className="profile-hero__info">
            <h2 className="user-panel__title">{form.fullName || 'My Profile'}</h2>
            <p className="user-panel__sub">
              {[form.age ? `${form.age} yrs` : null, form.occupation].filter(Boolean).join(' · ') || 'Complete your biodata'}
            </p>
            <p className="profile-hero__id">ID: {form.profileId || '—'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" className="btn btn-outline" onClick={() => setMode('view')}>
            <Eye size={15} /> View profile
          </button>
          <button type="button" className="btn btn-outline" onClick={() => setMode('print')}>
            <Printer size={15} /> Print
          </button>
          <button
            type="button"
            className={`btn profile-hero__edit ${editing ? 'btn-outline' : 'btn-primary'}`}
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? (
              'Cancel'
            ) : (
              <>
                <Pencil size={15} />
                Edit Profile
              </>
            )}
          </button>
        </div>
      </section>

      <form className="user-panel" onSubmit={save}>
        <div className="user-panel__head">
          <div>
            <h3 className="user-panel__title" style={{ fontSize: 20 }}>
              {editing ? 'Edit details' : 'Profile details'}
            </h3>
            <p className="user-panel__sub">Keep your biodata accurate for better matches.</p>
          </div>
        </div>

        <div className="user-tabs profile-tabs" role="tablist">
          {TABS.map(({ id, label, icon: Icon }) => (
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

        {tab === 'biodata' && (
          <div role="tabpanel" className="profile-tab-panel">
            <div className="user-form-grid">
              <Field label="Profile ID" name="profileId" readOnly {...props} />
              <Field
                label="Profile Created By"
                name="profileCreatedBy"
                type="select"
                options={PROFILE_CREATED_BY}
                {...props}
              />
              <Field label="Full Name" name="fullName" {...props} />
              <Field label="Gender" name="gender" type="select" options={GENDERS} {...props} />
              <Field label="Date of Birth" name="dateOfBirth" type="date" {...props} />
              <Field label="Age" name="age" type="number" {...props} />
              <Field label="Place of Birth" name="placeOfBirth" {...props} />
              <Field label="Time of Birth" name="timeOfBirth" type="time" {...props} />
              <Field label="Height" name="height" type="select" options={nameOpts(masters.heights)} {...props} />
              <Field label="Weight" name="weight" type="select" options={nameOpts(masters.weights)} {...props} />
              <Field
                label="Marital Status"
                name="maritalStatus"
                type="select"
                options={MARITAL_STATUS}
                {...props}
              />
              <Field
                label="Mother Tongue"
                name="motherTongue"
                type="select"
                options={nameOpts(masters.tongues)}
                {...props}
              />
              <Field
                label="Religion"
                name="religion"
                type="select"
                options={nameOpts(masters.religions)}
                {...props}
              />
              <Field
                label="Caste"
                name="caste"
                type="select"
                options={masters.castes.length ? nameOpts(masters.castes) : [{ value: '', label: 'Select religion first' }]}
                {...props}
              />
              <Field label="Sub-Caste" name="subCaste" {...props} />
              <Field label="Gothram" name="gothram" {...props} />
              <Field
                label="Star / Nakshatra"
                name="starNakshatra"
                type="select"
                options={NAKSHATRA_OPTIONS}
                {...props}
              />
              <Field label="Rasi" name="rasi" type="select" options={RASI_OPTIONS} {...props} />
              <Field label="Lagnam" name="lagnam" type="select" options={RASI_OPTIONS} {...props} />
              <Field
                label="Manglik / Chevvai Dosham"
                name="manglik"
                type="select"
                options={MANGlik_OPTIONS}
                {...props}
              />
              <Field label="Education" name="education" type="select" options={nameOpts(masters.educations)} {...props} />
              <Field label="Occupation" name="occupation" type="select" options={nameOpts(masters.occupations)} {...props} />
              <Field label="Company / Business Name" name="companyName" {...props} />
              <Field label="Work Location" name="workLocation" {...props} />
              <Field label="Monthly / Annual Income" name="income" {...props} />
              <Field label="Diet" name="diet" type="select" options={nameOpts(masters.diets)} {...props} />
              <Field label="Complexion" name="complexion" type="select" options={nameOpts(masters.complexions)} {...props} />
              <Field label="Body Type" name="bodytype" type="select" options={nameOpts(masters.bodyTypes)} {...props} />
              <Field
                label="Physical Status"
                name="physicalStatus"
                type="select"
                options={['Normal', 'Physically Challenged']}
                {...props}
              />
              <Field
                label="Contact Preference"
                name="contactPreference"
                type="select"
                options={CONTACT_PREFERENCE}
                {...props}
              />
              <Field label="About Me" name="aboutMe" type="textarea" {...props} />
            </div>
          </div>
        )}

        {tab === 'family' && (
          <div role="tabpanel" className="profile-tab-panel">
            <div className="user-form-grid">
              <Field label="Father's Name" name="fathersName" {...props} />
              <Field label="Father's Occupation" name="fathersOccupation" {...props} />
              <Field label="Mother's Name" name="mothersName" {...props} />
              <Field label="Mother's Occupation" name="mothersOccupation" {...props} />
              <Field label="Number of Brothers" name="numberOfBrothers" type="number" {...props} />
              <Field label="Number of Sisters" name="numberOfSisters" type="number" {...props} />
              <Field label="Brother's Marital Status" name="brothersMaritalStatus" {...props} />
              <Field label="Sister's Marital Status" name="sistersMaritalStatus" {...props} />
              <Field
                label="Family Type"
                name="familyType"
                type="select"
                options={FAMILY_TYPE}
                {...props}
              />
              <Field
                label="Family Status"
                name="familyStatus"
                type="select"
                options={FAMILY_STATUS}
                {...props}
              />
              <Field label="Native Place" name="nativePlace" {...props} />
              <Field label="Current Residence" name="currentResidence" {...props} />
              <Field
                label="Family Details / About Family"
                name="aboutFamily"
                type="textarea"
                {...props}
              />
            </div>
          </div>
        )}

        {tab === 'partner' && (
          <div role="tabpanel" className="profile-tab-panel">
            <div className="user-form-grid">
              <Field label="Preferred Age From" name="preferredAgeFrom" type="number" {...props} />
              <Field label="Preferred Age To" name="preferredAgeTo" type="number" {...props} />
              <Field
                label="Preferred Height From"
                name="preferredHeight"
                type="select"
                options={nameOpts(masters.heights)}
                {...props}
              />
              <Field
                label="Preferred Height To"
                name="preferredHeightTo"
                type="select"
                options={nameOpts(masters.heights)}
                {...props}
              />
              <Field
                label="Preferred Marital Status"
                name="preferredMaritalStatus"
                type="select"
                options={MARITAL_STATUS}
                {...props}
              />
              <Field
                label="Preferred Religion"
                name="preferredReligion"
                type="select"
                options={nameOpts(masters.religions)}
                {...props}
              />
              <Field label="Preferred Caste" name="preferredCaste" {...props} />
              <Field label="Preferred Sub-Caste" name="preferredSubCaste" {...props} />
              <Field
                label="Preferred Mother Tongue"
                name="preferredMotherTongue"
                type="select"
                options={nameOpts(masters.tongues)}
                {...props}
              />
              <Field
                label="Preferred Education"
                name="preferredEducation"
                type="select"
                options={nameOpts(masters.educations)}
                {...props}
              />
              <Field
                label="Preferred Occupation"
                name="preferredOccupation"
                type="select"
                options={nameOpts(masters.occupations)}
                {...props}
              />
              <Field label="Preferred Location" name="preferredLocation" {...props} />
              <Field
                label="Income Preference"
                name="incomePreference"
                type="select"
                options={INCOME_PREFERENCE}
                {...props}
              />
              <Field
                label="Food Preference"
                name="foodPreference"
                type="select"
                options={nameOpts(masters.diets)}
                {...props}
              />
              <Field
                label="Horoscope Preference"
                name="horoscopePreference"
                type="select"
                options={HOROSCOPE_PREFERENCE}
                {...props}
              />
              <Field
                label="Other Expectations"
                name="otherExpectations"
                type="textarea"
                {...props}
              />
            </div>
          </div>
        )}

        {tab === 'horoscope' && (
          <div role="tabpanel" className="profile-tab-panel">
            <div className="user-form-grid">
              <Field label="Date of Birth" name="dateOfBirth" type="date" {...props} />
              <Field label="Time of Birth" name="timeOfBirth" type="time" {...props} />
              <Field label="Place of Birth" name="placeOfBirth" {...props} />
              <Field label="Rasi" name="rasi" type="select" options={RASI_OPTIONS} {...props} />
              <Field
                label="Nakshatra / Star"
                name="starNakshatra"
                type="select"
                options={NAKSHATRA_OPTIONS}
                {...props}
              />
              <Field
                label="Pada"
                name="horoscopePada"
                type="select"
                options={PADA_OPTIONS}
                {...props}
              />
              <Field label="Lagnam" name="lagnam" type="select" options={RASI_OPTIONS} {...props} />
              <Field label="Gothram" name="gothram" {...props} />
              <Field
                label="Chevvai Dosham"
                name="chevvaiDosham"
                type="select"
                options={DOSHAM_OPTIONS}
                {...props}
              />
              <Field
                label="Rahu / Ketu Dosham"
                name="rahuKetuDosham"
                type="select"
                options={DOSHAM_OPTIONS}
                {...props}
              />
              <FileField
                label="Horoscope Chart"
                name="horoscopeChart"
                filePreview={filePreviews.horoscopeChart}
                {...fileProps}
              />
              <FileField
                label="Navamsam Chart"
                name="navamsamChart"
                filePreview={filePreviews.navamsamChart}
                {...fileProps}
              />
            </div>
            <div className="profile-horoscope-charts" style={{ marginTop: 20 }}>
              <h3 className="user-panel__sub" style={{ marginBottom: 10, fontWeight: 700 }}>
                RASI &amp; AMSAM — click planets in each house
              </h3>
              <HoroscopeChartsEditor
                values={form}
                disabled={!editing}
                onChange={(key, val) => update(key)({ target: { value: val } })}
              />
            </div>
          </div>
        )}

        {tab === 'documents' && (
          <div role="tabpanel" className="profile-tab-panel">
            <div className="user-form-grid">
              <FileField
                {...fileProps}
                label="Profile Photo"
                name="profilePhoto"
                filePreview={filePreviews.profilePhoto}
              />
              <FileField
                label="Horoscope Document"
                name="horoscopeDocument"
                filePreview={filePreviews.horoscopeDocument}
                {...fileProps}
              />
              <FileField
                label="Aadhaar / ID Proof"
                name="aadhaarProof"
                filePreview={filePreviews.aadhaarProof}
                {...fileProps}
              />
              <FileField
                label="Education Certificate"
                name="educationCertificate"
                filePreview={filePreviews.educationCertificate}
                {...fileProps}
              />
              <FileField
                label="Income Proof"
                name="incomeProof"
                filePreview={filePreviews.incomeProof}
                {...fileProps}
              />
              <FileField
                label="Other Supporting Documents"
                name="otherDocuments"
                filePreview={filePreviews.otherDocuments}
                {...fileProps}
              />
              <label className="user-field user-form-grid--full">
                <span>Document Verification Status</span>
                <div className="profile-doc-status">
                  <ShieldCheck size={16} />
                  <span
                    className={`profile-doc-status__badge profile-doc-status__badge--${String(form.documentVerificationStatus || 'pending').toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {form.documentVerificationStatus || 'Pending'}
                  </span>
                  {editing && (
                    <select
                      value={form.documentVerificationStatus || ''}
                      onChange={update('documentVerificationStatus')}
                      className="profile-doc-status__select"
                    >
                      {VERIFICATION_STATUS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </label>
              <div className="user-form-grid--full">
                <PhotoGallery
                  editing={editing}
                  gallery={galleryPhotos}
                  onUpload={updateGallery}
                  onPreview={openPreview}
                  onRemove={removeGalleryPhoto}
                />
              </div>
            </div>
          </div>
        )}

        {editing && (
          <div className="profile-actions">
            <button type="submit" className="btn btn-primary">
              <Save size={15} />
              Save Changes
            </button>
          </div>
        )}
      </form>

      <FilePreviewModal file={activePreview} onClose={() => setActivePreview(null)} />
    </div>
  )
}
