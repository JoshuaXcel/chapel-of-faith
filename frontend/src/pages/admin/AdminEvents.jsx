import { useState } from 'react'
import Button from '../../components/Button.jsx'
import Icon from '../../components/Icon.jsx'
import Loading from '../../components/Loading.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import ImageUpload from './ImageUpload.jsx'
import useFetch from '../../useFetch.js'
import { del, patch, post } from '../../api.js'
import { longDate, time } from '../../format.js'

// What the form holds when adding a new event. Form inputs always hold text,
// so empty fields are '' here and are turned into null before saving.
const emptyForm = {
  title: '',
  description: '',
  location: 'Chapel of Faith Auditorium',
  starts_at: '',
  ends_at: '',
  image_url: '',
}

// The backend sends "2026-10-30T18:00:00"; a datetime-local input wants "2026-10-30T18:00"
function toInputDateTime(value) {
  return value ? value.slice(0, 16) : ''
}

function AdminEvents() {
  const { data: events, loading, error, reload } = useFetch('/events')

  const [form, setForm] = useState(null) // null means the form is closed
  const [editingId, setEditingId] = useState(null) // null means "adding a new event"
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  function startAdding() {
    setForm(emptyForm)
    setEditingId(null)
    setFormError('')
    setNotice('')
  }

  function startEditing(event) {
    setForm({
      title: event.title,
      description: event.description || '',
      location: event.location,
      starts_at: toInputDateTime(event.starts_at),
      ends_at: toInputDateTime(event.ends_at),
      image_url: event.image_url || '',
    })
    setEditingId(event.id)
    setFormError('')
    setNotice('')
  }

  function closeForm() {
    setForm(null)
    setEditingId(null)
  }

  // One handler for every text input: the input's "name" says which field to change
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setFormError('')

    // What the backend expects (see EventCreate / EventUpdate in backend/app/schemas.py)
    const body = {
      title: form.title,
      description: form.description || null,
      location: form.location,
      starts_at: form.starts_at,
      ends_at: form.ends_at || null,
      image_url: form.image_url || null,
    }

    try {
      if (editingId) {
        await patch(`/events/${editingId}`, body)
        setNotice('Event updated.')
      } else {
        await post('/events', body)
        setNotice('Event added.')
      }
      closeForm()
      reload() // load the list again so it shows the change
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(event) {
    // window.confirm shows the browser's own "OK / Cancel" box
    if (!window.confirm(`Delete "${event.title}"? This cannot be undone.`)) return
    try {
      await del(`/events/${event.id}`)
      setNotice('Event deleted.')
      if (editingId === event.id) closeForm()
      reload()
    } catch (err) {
      setNotice('')
      setFormError(err.message)
    }
  }

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Events</h1>
          {/* The backend's list only returns events that have not started yet */}
          <p className="sub">Upcoming special programmes shown on the Events page.</p>
        </div>
        <Button variant="plum" onClick={startAdding}>
          <Icon name="plus" /> Add event
        </Button>
      </div>

      {notice && <p className="notice">{notice}</p>}

      <div className={form ? 'ed-grid' : ''}>
        <div className="panel">
          {loading && <Loading />}
          <ErrorMessage message={error} />
          {events && events.length === 0 && <p className="panel-empty">No upcoming events.</p>}
          {events && events.length > 0 && (
            <div className="table-scroll">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Date</th>
                    <th className="hide-m">Where</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className={editingId === event.id ? 'sel' : ''}>
                      <td className="strong">{event.title}</td>
                      <td>
                        {longDate(event.starts_at)}
                        <div className="tiny muted">{time(event.starts_at)}</div>
                      </td>
                      <td className="hide-m">{event.location}</td>
                      <td className="actions">
                        <button
                          className="btn btn-soft btn-sm"
                          type="button"
                          onClick={() => startEditing(event)}
                        >
                          Edit
                        </button>
                        <button
                          className="iconbtn danger"
                          type="button"
                          onClick={() => handleDelete(event)}
                          aria-label={`Delete ${event.title}`}
                        >
                          <Icon name="trash" size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {form && (
          <form className="drawer" onSubmit={handleSubmit}>
            <div className="flex between">
              <h3 className="drawer-title">{editingId ? 'Edit event' : 'New event'}</h3>
              <button className="iconbtn" type="button" onClick={closeForm} aria-label="Close form">
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="stack g16 mt20">
              <ErrorMessage message={formError} />
              <div className="field">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  className="input"
                  required
                  value={form.title}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="starts_at">Starts</label>
                <input
                  id="starts_at"
                  name="starts_at"
                  className="input"
                  type="datetime-local"
                  required
                  value={form.starts_at}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="ends_at">
                  Ends <small>(optional)</small>
                </label>
                <input
                  id="ends_at"
                  name="ends_at"
                  className="input"
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="location">Where</label>
                <input
                  id="location"
                  name="location"
                  className="input"
                  required
                  value={form.location}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="description">
                  Description <small>(optional)</small>
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="input"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <span className="field-label">
                  Banner image <small>(optional)</small>
                </span>
                {/* ImageUpload uploads the file and hands back its address */}
                <ImageUpload
                  value={form.image_url}
                  onChange={(url) => setForm({ ...form, image_url: url })}
                />
              </div>
              <Button type="submit" variant="plum" block disabled={saving}>
                {saving ? 'Saving…' : 'Save event'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

export default AdminEvents
