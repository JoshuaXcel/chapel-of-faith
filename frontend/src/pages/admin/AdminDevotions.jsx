import { useState } from 'react'
import Button from '../../components/Button.jsx'
import Icon from '../../components/Icon.jsx'
import Loading from '../../components/Loading.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import useFetch from '../../useFetch.js'
import { del, patch, post } from '../../api.js'
import { shortDate, todayString } from '../../format.js'

// What the form holds when adding a new devotion ('' = empty, turned into null when saving)
const emptyForm = {
  title: '',
  devotion_date: '',
  scripture: '',
  author: '',
  body: '',
}

function AdminDevotions() {
  const { data: devotions, loading, error, reload } = useFetch('/devotions')

  const [form, setForm] = useState(null) // null means the form is closed
  const [editingId, setEditingId] = useState(null) // null means "adding a new devotion"
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  function startAdding() {
    // New devotions start on today's date; there can only be one per day
    setForm({ ...emptyForm, devotion_date: todayString() })
    setEditingId(null)
    setFormError('')
    setNotice('')
  }

  function startEditing(devotion) {
    setForm({
      title: devotion.title,
      devotion_date: devotion.devotion_date,
      scripture: devotion.scripture,
      author: devotion.author || '',
      body: devotion.body,
    })
    setEditingId(devotion.id)
    setFormError('')
    setNotice('')
  }

  function closeForm() {
    setForm(null)
    setEditingId(null)
  }

  // One handler for every input: the input's "name" says which field to change
  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setFormError('')

    // What the backend expects (see DevotionCreate / DevotionUpdate in backend/app/schemas.py)
    const body = {
      title: form.title,
      devotion_date: form.devotion_date,
      scripture: form.scripture,
      author: form.author || null,
      body: form.body,
    }

    try {
      if (editingId) {
        await patch(`/devotions/${editingId}`, body)
        setNotice('Devotion updated.')
      } else {
        await post('/devotions', body)
        setNotice('Devotion added.')
      }
      closeForm()
      reload()
    } catch (err) {
      // e.g. "A devotion for that date already exists" (409 from the backend)
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(devotion) {
    if (!window.confirm(`Delete "${devotion.title}"? This cannot be undone.`)) return
    try {
      await del(`/devotions/${devotion.id}`)
      setNotice('Devotion deleted.')
      if (editingId === devotion.id) closeForm()
      reload()
    } catch (err) {
      setNotice('')
      setFormError(err.message)
    }
  }

  const today = todayString()

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Devotions</h1>
          <p className="sub">One devotion per day. Future dates go live on their day.</p>
        </div>
        <Button variant="plum" onClick={startAdding}>
          <Icon name="plus" /> Add devotion
        </Button>
      </div>

      {notice && <p className="notice">{notice}</p>}

      <div className={form ? 'ed-grid' : ''}>
        <div className="panel">
          {loading && <Loading />}
          <ErrorMessage message={error} />
          {devotions && devotions.length === 0 && <p className="panel-empty">No devotions yet.</p>}
          {devotions && devotions.length > 0 && (
            <div className="table-scroll">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th className="hide-m">Scripture</th>
                    <th className="hide-m">Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {devotions.map((devotion) => (
                    <tr key={devotion.id} className={editingId === devotion.id ? 'sel' : ''}>
                      <td>{shortDate(devotion.devotion_date)}</td>
                      <td className="strong">{devotion.title}</td>
                      <td className="hide-m">{devotion.scripture}</td>
                      <td className="hide-m">
                        {/* Dates are "YYYY-MM-DD" text, so they compare correctly as text */}
                        {devotion.devotion_date > today ? (
                          <span className="status st-sched">Scheduled</span>
                        ) : (
                          <span className="status st-pub">Published</span>
                        )}
                      </td>
                      <td className="actions">
                        <button
                          className="btn btn-soft btn-sm"
                          type="button"
                          onClick={() => startEditing(devotion)}
                        >
                          Edit
                        </button>
                        <button
                          className="iconbtn danger"
                          type="button"
                          onClick={() => handleDelete(devotion)}
                          aria-label={`Delete ${devotion.title}`}
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
              <h3 className="drawer-title">{editingId ? 'Edit devotion' : 'New devotion'}</h3>
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
                <label htmlFor="devotion_date">Date</label>
                <input
                  id="devotion_date"
                  name="devotion_date"
                  className="input"
                  type="date"
                  required
                  value={form.devotion_date}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="scripture">
                  Scripture <small>(e.g. Hebrews 10:25)</small>
                </label>
                <input
                  id="scripture"
                  name="scripture"
                  className="input"
                  required
                  value={form.scripture}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="author">
                  Author <small>(optional)</small>
                </label>
                <input
                  id="author"
                  name="author"
                  className="input"
                  value={form.author}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="body">
                  Reading <small>(leave a blank line between paragraphs)</small>
                </label>
                <textarea
                  id="body"
                  name="body"
                  className="input tall"
                  required
                  value={form.body}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" variant="plum" block disabled={saving}>
                {saving ? 'Saving…' : 'Save devotion'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

export default AdminDevotions
