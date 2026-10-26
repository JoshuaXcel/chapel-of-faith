import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import PageHeader from '../components/PageHeader.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { post } from '../api.js'
import { daysInMonth, levels, memberTypes, monthNames } from '../membership.js'

// Membership page (/membership): the "Make it official" registration form.
// When someone submits it, the details are saved in the backend's `members`
// table (POST /members, no login needed). Admins see them at /admin/members.

// What an empty form looks like. Each key matches a field the backend expects
// (see MemberCreate in backend/app/schemas.py).
const emptyForm = {
  full_name: '',
  phone: '',
  email: '',
  gender: '',
  member_type: '', // "undergraduate", "graduate", "staff" or "other"
  department: '',
  level: '',
  hostel_or_address: '',
  birth_day: '', // 1-31, required
  birth_month: '', // 1-12, required
  birth_year: '', // optional: not everyone wants to share their age
  joined_whatsapp_consent: false,
}

// Numbers 1 to 31 for the "Day" drop-down
const dayNumbers = Array.from({ length: 31 }, (_, index) => index + 1)

// The department box has a different label (and example) for each type.
// "other" is missing on purpose: they don't get a department box at all.
const departmentLabels = {
  undergraduate: { label: 'Department', placeholder: 'e.g. Computer Science' },
  graduate: { label: 'Course studied', placeholder: 'e.g. Industrial Chemistry' },
  staff: { label: 'Department', placeholder: 'e.g. Bursary, Library' },
}

// Checks the birthday. Returns a message, or '' if it is fine.
function birthdayProblem(form) {
  if (!form.birth_day || !form.birth_month) {
    return 'Please choose the day and month of your birthday.'
  }
  const thisYear = new Date().getFullYear()
  const year = form.birth_year.trim()
  // the year is optional, but if it's typed it must be 4 digits between 1900 and this year
  if (year && (!/^\d{4}$/.test(year) || Number(year) < 1900 || Number(year) > thisYear)) {
    return `Please enter a year between 1900 and ${thisYear}, or leave it empty.`
  }
  // dates that don't exist, like 31 April or 30 February
  const day = Number(form.birth_day)
  const month = Number(form.birth_month)
  if (day > daysInMonth(month, Number(year))) {
    const date = `${day} ${monthNames[month - 1]}${year ? ` ${year}` : ''}`
    return `${date} is not a real date. Please check the day and month.`
  }
  return ''
}

// Checks the form before sending it, like Pydantic does on the backend.
// Returns an object of problems, e.g. { phone: 'Please enter your phone number.' }.
// An empty object means the form is fine.
function validate(form) {
  const errors = {}
  if (!form.full_name.trim()) {
    errors.full_name = 'Please enter your full name.'
  }
  if (!form.phone.trim()) {
    errors.phone = 'Please enter your phone number.'
  } else if (!/^\+?[0-9\s-]{7,20}$/.test(form.phone.trim())) {
    // digits, spaces and dashes, with an optional + at the start (e.g. +234 801 234 5678)
    errors.phone = 'Please enter a valid phone number, e.g. 0801 234 5678.'
  }
  if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address, or leave it empty.'
  }
  if (!form.member_type) {
    errors.member_type = 'Please choose one: Undergraduate, Graduate, Staff or Other.'
  }
  const birthday = birthdayProblem(form)
  if (birthday) {
    errors.birthday = birthday
  }
  return errors
}

// Turns the form into what the backend wants: text is trimmed and an
// optional field left empty is sent as null (the database stores "nothing").
function toPayload(form) {
  const payload = {}
  for (const [key, value] of Object.entries(form)) {
    if (typeof value === 'string') {
      const trimmed = value.trim()
      payload[key] = trimmed === '' ? null : trimmed
    } else {
      payload[key] = value
    }
  }
  // the birthday boxes hold text ("12"), but the backend wants numbers (12)
  payload.birth_day = Number(form.birth_day)
  payload.birth_month = Number(form.birth_month)
  payload.birth_year = form.birth_year.trim() ? Number(form.birth_year) : null
  // only undergraduates have a level, and "other" has no department
  if (form.member_type !== 'undergraduate') payload.level = null
  if (form.member_type === 'other') payload.department = null
  return payload
}

function Membership() {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({}) // problems found by validate()
  const [sending, setSending] = useState(false) // true while waiting for the backend
  const [serverError, setServerError] = useState('') // message if the backend said no
  const [registeredName, setRegisteredName] = useState('') // set after a successful submit

  // One change handler for every field: it uses the input's `name` to know
  // which key of `form` to update. Checkboxes use `checked` instead of `value`.
  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
    // clear the error under this field as soon as the person edits it.
    // The three birthday boxes share one message, called "birthday".
    const errorKey = name.startsWith('birth_') ? 'birthday' : name
    if (errors[errorKey]) setErrors({ ...errors, [errorKey]: undefined })
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser reloading the page
    const problems = validate(form)
    setErrors(problems)
    if (Object.keys(problems).length > 0) return

    setSending(true)
    setServerError('')
    try {
      const member = await post('/members', toPayload(form))
      setRegisteredName(member.full_name)
      setForm(emptyForm)
    } catch (err) {
      setServerError(err.message)
    } finally {
      setSending(false)
    }
  }

  // Small helper so every field shows its error the same way.
  // aria-describedby links the message to the input for screen readers.
  function fieldError(name) {
    if (!errors[name]) return null
    return (
      <span id={`${name}-error`} className="field-error">
        {errors[name]}
      </span>
    )
  }

  return (
    <>
      <PageHeader
        crumb="Membership"
        eyebrow="Membership"
        title={
          <>
            Make it <em className="accent">official</em>
          </>
        }
        lead="Been worshipping with us? Register as a member to be added to the church database and the official WhatsApp groups."
      />

      <section className="sec two-col-section">
        <div className="wrap two-col">
          {registeredName ? (
            // After a successful submit we show a thank-you card instead of the form
            <div className="card card-pad big-pad member-done" role="status">
              <span className="icon-tile gold">
                <Icon name="check" />
              </span>
              <h3 className="mt20">Welcome, {registeredName}!</h3>
              <p className="lead mt12">
                Thank you! You&apos;ve been registered as a member of the Chapel of Faith. Welcome to
                the family. The Chapel will be in touch.
              </p>
              <div className="flex g12 mt24 wrapx">
                <Button to="/">Back to home</Button>
                <Button variant="outline" onClick={() => setRegisteredName('')}>
                  Register someone else
                </Button>
              </div>
            </div>
          ) : (
            // noValidate: we show our own friendly messages instead of the browser's
            <form className="card card-pad big-pad" onSubmit={handleSubmit} noValidate>
              <h3>Membership form</h3>
              <p className="small muted mt8">
                Fields marked <span className="req">*</span> are required.
              </p>

              <fieldset className="stack g20 mt24" disabled={sending}>
                <div className="field">
                  <label htmlFor="full_name">
                    Full name <span className="req">*</span>
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    className="input"
                    autoComplete="name"
                    placeholder="e.g. Ada Okafor"
                    maxLength={120}
                    value={form.full_name}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.full_name)}
                    aria-describedby={errors.full_name ? 'full_name-error' : undefined}
                  />
                  {fieldError('full_name')}
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="phone">
                      Phone (WhatsApp) <span className="req">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="input"
                      autoComplete="tel"
                      placeholder="0801 234 5678"
                      maxLength={30}
                      value={form.phone}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'phone-error' : undefined}
                    />
                    {fieldError('phone')}
                  </div>
                  <div className="field">
                    <label htmlFor="email">
                      Email <small>(optional)</small>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="input"
                      autoComplete="email"
                      placeholder="you@example.com"
                      maxLength={255}
                      value={form.email}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {fieldError('email')}
                  </div>
                </div>

                {/* "I am a…": four big tappable options. They are radio buttons
                    (only one can be picked), styled to look like cards. */}
                <div
                  className="field"
                  role="radiogroup"
                  aria-labelledby="member_type-label"
                  aria-describedby={errors.member_type ? 'member_type-error' : undefined}
                >
                  <span id="member_type-label" className="field-label">
                    I am a… <span className="req">*</span>
                  </span>
                  <div className="type-options">
                    {memberTypes.map((type) => (
                      <label
                        key={type.value}
                        className={`type-option${form.member_type === type.value ? ' on' : ''}`}
                      >
                        <input
                          type="radio"
                          name="member_type"
                          value={type.value}
                          checked={form.member_type === type.value}
                          onChange={handleChange}
                        />
                        <span>{type.label}</span>
                      </label>
                    ))}
                  </div>
                  {fieldError('member_type')}
                </div>

                {/* Department / Level: which boxes show depends on the choice above */}
                {form.member_type === 'undergraduate' && (
                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="department">
                        Department <small>(optional)</small>
                      </label>
                      <input
                        id="department"
                        name="department"
                        className="input"
                        placeholder={departmentLabels.undergraduate.placeholder}
                        maxLength={120}
                        value={form.department}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="level">
                        Level <small>(optional)</small>
                      </label>
                      <select
                        id="level"
                        name="level"
                        className="input"
                        value={form.level}
                        onChange={handleChange}
                      >
                        <option value="">Choose…</option>
                        {levels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                {/* Graduates get "Course studied", staff get "Department", and
                    "other" gets nothing (departmentLabels has no "other") */}
                {(form.member_type === 'graduate' || form.member_type === 'staff') && (
                  <div className="field">
                    <label htmlFor="department">
                      {departmentLabels[form.member_type].label} <small>(optional)</small>
                    </label>
                    <input
                      id="department"
                      name="department"
                      className="input"
                      placeholder={departmentLabels[form.member_type].placeholder}
                      maxLength={120}
                      value={form.department}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {/* Birthday: day and month are required, the year is optional */}
                <div
                  className="field"
                  role="group"
                  aria-labelledby="birthday-label"
                  aria-describedby={errors.birthday ? 'birthday-error' : undefined}
                >
                  <span id="birthday-label" className="field-label">
                    Birthday
                  </span>
                  <div className="birthday-row">
                    <div className="field">
                      <label htmlFor="birth_day" className="sub-label">
                        Day <span className="req">*</span>
                      </label>
                      <select
                        id="birth_day"
                        name="birth_day"
                        className="input"
                        value={form.birth_day}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.birthday)}
                      >
                        <option value="">Day</option>
                        {dayNumbers.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="birth_month" className="sub-label">
                        Month <span className="req">*</span>
                      </label>
                      <select
                        id="birth_month"
                        name="birth_month"
                        className="input"
                        value={form.birth_month}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.birthday)}
                      >
                        <option value="">Month</option>
                        {/* the value is the month's number: January = 1 */}
                        {monthNames.map((month, index) => (
                          <option key={month} value={index + 1}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="birth_year" className="sub-label">
                        Year <small>(optional)</small>
                      </label>
                      {/* text with a number keypad, not type="number", which adds
                          little up/down arrows that are easy to tap by mistake */}
                      <input
                        id="birth_year"
                        name="birth_year"
                        className="input"
                        inputMode="numeric"
                        placeholder="e.g. 2004"
                        maxLength={4}
                        value={form.birth_year}
                        onChange={handleChange}
                        aria-invalid={Boolean(errors.birthday)}
                      />
                    </div>
                  </div>
                  {fieldError('birthday')}
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="gender">
                      Gender <small>(optional)</small>
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="input"
                      value={form.gender}
                      onChange={handleChange}
                    >
                      <option value="">Choose…</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="hostel_or_address">
                      Hostel or address <small>(optional)</small>
                    </label>
                    <input
                      id="hostel_or_address"
                      name="hostel_or_address"
                      className="input"
                      placeholder="e.g. Jadesola Hall"
                      maxLength={255}
                      value={form.hostel_or_address}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <label className="check-row">
                  <input
                    type="checkbox"
                    name="joined_whatsapp_consent"
                    checked={form.joined_whatsapp_consent}
                    onChange={handleChange}
                  />
                  <span>Add me to the Chapel&apos;s official WhatsApp groups</span>
                </label>

                <ErrorMessage message={serverError} />

                <Button type="submit" size="lg" block>
                  {sending ? 'Sending…' : 'Register as a member'}
                </Button>
              </fieldset>
            </form>
          )}

          <div className="stack g20">
            <div className="card-flat big-pad">
              <h4>Why register?</h4>
              <div className="steps mt20">
                <div className="step">
                  <span className="n">1</span>
                  <p>You are added to the Chapel&apos;s membership records.</p>
                </div>
                <div className="step">
                  <span className="n">2</span>
                  <p>You join the official WhatsApp groups and never miss an announcement.</p>
                </div>
                <div className="step">
                  <span className="n">3</span>
                  <p>Stay connected, informed and involved as we grow together in faith.</p>
                </div>
              </div>
            </div>
            <div className="card card-pad flat-card">
              <div className="flex g16 align-start">
                <span className="icon-tile gold">
                  <Icon name="shield" />
                </span>
                <div>
                  <h4>Your details are safe</h4>
                  <p className="small muted mt8">
                    Only the Chapel&apos;s admins can see them. They are never shown on the website.
                  </p>
                  <Link className="link mt12" to="/events">
                    See weekly activities <Icon name="arrowRight" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Membership
