import { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import PageHeader from '../components/PageHeader.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import { post } from '../api.js'

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
  department: '',
  level: '',
  hostel_or_address: '',
  birthday: '',
  joined_whatsapp_consent: false,
}

// Choices for the "Level" drop-down
const levels = ['100L', '200L', '300L', '400L', '500L', 'Postgraduate', 'Staff', 'Other']

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
    // clear the error under this field as soon as the person edits it
    if (errors[name]) setErrors({ ...errors, [name]: undefined })
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
                    <label htmlFor="birthday">
                      Birthday <small>(optional)</small>
                    </label>
                    <input
                      id="birthday"
                      name="birthday"
                      type="date"
                      className="input"
                      value={form.birthday}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="department">
                      Department <small>(optional)</small>
                    </label>
                    <input
                      id="department"
                      name="department"
                      className="input"
                      placeholder="e.g. Computer Science"
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

                <div className="field">
                  <label htmlFor="hostel_or_address">
                    Hostel or address <small>(optional)</small>
                  </label>
                  <input
                    id="hostel_or_address"
                    name="hostel_or_address"
                    className="input"
                    placeholder="e.g. Jadesola Hall, or your address in Akure"
                    maxLength={255}
                    value={form.hostel_or_address}
                    onChange={handleChange}
                  />
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
