import { useState } from 'react'
import Button from '../../components/Button.jsx'
import Icon from '../../components/Icon.jsx'
import Loading from '../../components/Loading.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import useFetch from '../../useFetch.js'
import { del, patch, post } from '../../api.js'
import { shortDate } from '../../format.js'

// What the form holds when adding a new sermon ('' = empty, turned into null when saving)
const emptyForm = {
  title: '',
  preacher: '',
  preached_on: '',
  scripture: '',
  description: '',
  audio_url: '',
}

function AdminSermons() {
  const { data: sermons, loading, error, reload } = useFetch('/sermons')

  const [form, setForm] = useState(null) // null means the form is closed
  const [editingId, setEditingId] = useState(null) // null means "adding a new sermon"
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  function startAdding() {
    setForm(emptyForm)
    setEditingId(null)
    setFormError('')
    setNotice('')
  }

  function startEditing(sermon) {
    setForm({
      title: sermon.title,
      preacher: sermon.preacher,
      preached_on: sermon.preached_on,
      scripture: sermon.scripture || '',
      description: sermon.description || '',
      audio_url: sermon.audio_url || '',
    })
    setEditingId(sermon.id)
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

    // What the backend expects (see SermonCreate / SermonUpdate in backend/app/schemas.py)
    const body = {
      title: form.title,
      preacher: form.preacher,
      preached_on: form.preached_on,
      scripture: form.scripture || null,
      description: form.description || null,
      audio_url: form.audio_url || null,
    }

    try {
      if (editingId) {
        await patch(`/sermons/${editingId}`, body)
        setNotice('Sermon updated.')
      } else {
        await post('/sermons', body)
        setNotice('Sermon added.')
      }
      closeForm()
      reload()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(sermon) {
    if (!window.confirm(`Delete "${sermon.title}"? This cannot be undone.`)) return
    try {
      await del(`/sermons/${sermon.id}`)
      setNotice('Sermon deleted.')
      if (editingId === sermon.id) closeForm()
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
          <h1>Sermons</h1>
          <p className="sub">Messages shown in the Sermon library, newest first.</p>
        </div>
        <Button variant="plum" onClick={startAdding}>
          <Icon name="plus" /> Add sermon
        </Button>
      </div>

      {notice && <p className="notice">{notice}</p>}

      <div className={form ? 'ed-grid' : ''}>
        <div className="panel">
          {loading && <Loading />}
          <ErrorMessage message={error} />
          {sermons && sermons.length === 0 && <p className="panel-empty">No sermons yet.</p>}
          {sermons && sermons.length > 0 && (
            <div className="table-scroll">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th className="hide-m">Preacher</th>
                    <th>Date</th>
                    <th className="hide-m">Audio</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sermons.map((sermon) => (
                    <tr key={sermon.id} className={editingId === sermon.id ? 'sel' : ''}>
                      <td className="strong">{sermon.title}</td>
                      <td className="hide-m">{sermon.preacher}</td>
                      <td>{shortDate(sermon.preached_on)}</td>
                      <td className="hide-m">
                        {sermon.audio_url ? (
                          <span className="status st-pub">Yes</span>
                        ) : (
                          <span className="status st-draft">No</span>
                        )}
                      </td>
                      <td className="actions">
                        <button
                          className="btn btn-soft btn-sm"
                          type="button"
                          onClick={() => startEditing(sermon)}
                        >
                          Edit
                        </button>
                        <button
                          className="iconbtn danger"
                          type="button"
                          onClick={() => handleDelete(sermon)}
                          aria-label={`Delete ${sermon.title}`}
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
              <h3 className="drawer-title">{editingId ? 'Edit sermon' : 'New sermon'}</h3>
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
                <label htmlFor="preacher">Preacher</label>
                <input
                  id="preacher"
                  name="preacher"
                  className="input"
                  required
                  value={form.preacher}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="preached_on">Date preached</label>
                <input
                  id="preached_on"
                  name="preached_on"
                  className="input"
                  type="date"
                  required
                  value={form.preached_on}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="scripture">
                  Scripture <small>(optional, e.g. Habakkuk 2:4)</small>
                </label>
                <input
                  id="scripture"
                  name="scripture"
                  className="input"
                  value={form.scripture}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="description">
                  Summary <small>(optional)</small>
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
                <label htmlFor="audio_url">
                  Audio link <small>(optional, a link to an MP3 file)</small>
                </label>
                <input
                  id="audio_url"
                  name="audio_url"
                  className="input"
                  type="url"
                  placeholder="https://…"
                  value={form.audio_url}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" variant="plum" block disabled={saving}>
                {saving ? 'Saving…' : 'Save sermon'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

export default AdminSermons
