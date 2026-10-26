import { useState } from 'react'
import Button from '../../components/Button.jsx'
import Icon from '../../components/Icon.jsx'
import Loading from '../../components/Loading.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import ImageUpload from './ImageUpload.jsx'
import useFetch from '../../useFetch.js'
import { del, mediaUrl, patch, post } from '../../api.js'

// What the form holds when adding a new leader ('' = empty, turned into null when saving)
const emptyForm = {
  name: '',
  role: '',
  display_order: '0',
  bio: '',
  photo_url: '',
}

function AdminLeadership() {
  const { data: leaders, loading, error, reload } = useFetch('/leadership')

  const [form, setForm] = useState(null) // null means the form is closed
  const [editingId, setEditingId] = useState(null) // null means "adding a new leader"
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  function startAdding() {
    // Put new people at the end of the list by default
    const nextOrder = leaders ? leaders.length : 0
    setForm({ ...emptyForm, display_order: String(nextOrder) })
    setEditingId(null)
    setFormError('')
    setNotice('')
  }

  function startEditing(leader) {
    setForm({
      name: leader.name,
      role: leader.role,
      display_order: String(leader.display_order),
      bio: leader.bio || '',
      photo_url: leader.photo_url || '',
    })
    setEditingId(leader.id)
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

    // What the backend expects (see LeadershipCreate / LeadershipUpdate in backend/app/schemas.py)
    const body = {
      name: form.name,
      role: form.role,
      // inputs give text ("2"); the backend wants a whole number (2)
      display_order: Number(form.display_order),
      bio: form.bio || null,
      photo_url: form.photo_url || null,
    }

    try {
      if (editingId) {
        await patch(`/leadership/${editingId}`, body)
        setNotice('Leader updated.')
      } else {
        await post('/leadership', body)
        setNotice('Leader added.')
      }
      closeForm()
      reload()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(leader) {
    if (!window.confirm(`Remove ${leader.name}? This cannot be undone.`)) return
    try {
      await del(`/leadership/${leader.id}`)
      setNotice('Leader removed.')
      if (editingId === leader.id) closeForm()
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
          <h1>Leadership</h1>
          <p className="sub">
            Shown on the About page in this order. Number 0 (usually the Chaplain) is featured.
          </p>
        </div>
        <Button variant="plum" onClick={startAdding}>
          <Icon name="plus" /> Add leader
        </Button>
      </div>

      {notice && <p className="notice">{notice}</p>}

      <div className={form ? 'ed-grid' : ''}>
        <div className="panel">
          {loading && <Loading />}
          <ErrorMessage message={error} />
          {leaders && leaders.length === 0 && <p className="panel-empty">No leaders yet.</p>}
          {leaders && leaders.length > 0 && (
            <div className="table-scroll">
              <table className="tbl">
                <thead>
                  <tr>
                    <th className="hide-m">Order</th>
                    <th>Name</th>
                    <th className="hide-m">Role</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((leader) => (
                    <tr key={leader.id} className={editingId === leader.id ? 'sel' : ''}>
                      <td className="hide-m">{leader.display_order}</td>
                      <td>
                        <span className="flex g12">
                          {leader.photo_url ? (
                            <img className="thumb round" src={mediaUrl(leader.photo_url)} alt="" />
                          ) : (
                            <span className="avatar soft">{leader.name.charAt(0)}</span>
                          )}
                          <span className="strong">{leader.name}</span>
                        </span>
                      </td>
                      <td className="hide-m">{leader.role}</td>
                      <td className="actions">
                        <button
                          className="btn btn-soft btn-sm"
                          type="button"
                          onClick={() => startEditing(leader)}
                        >
                          Edit
                        </button>
                        <button
                          className="iconbtn danger"
                          type="button"
                          onClick={() => handleDelete(leader)}
                          aria-label={`Delete ${leader.name}`}
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
              <h3 className="drawer-title">{editingId ? 'Edit leader' : 'New leader'}</h3>
              <button className="iconbtn" type="button" onClick={closeForm} aria-label="Close form">
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="stack g16 mt20">
              <ErrorMessage message={formError} />
              <div className="field">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  className="input"
                  required
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="role">
                  Role <small>(e.g. Chaplain, Secretary)</small>
                </label>
                <input
                  id="role"
                  name="role"
                  className="input"
                  required
                  value={form.role}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="display_order">
                  Order on the page <small>(0 comes first)</small>
                </label>
                <input
                  id="display_order"
                  name="display_order"
                  className="input"
                  type="number"
                  min="0"
                  required
                  value={form.display_order}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <label htmlFor="bio">
                  Short bio <small>(optional)</small>
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  className="input"
                  value={form.bio}
                  onChange={handleChange}
                />
              </div>
              <div className="field">
                <span className="field-label">
                  Photo <small>(optional)</small>
                </span>
                <ImageUpload
                  value={form.photo_url}
                  onChange={(url) => setForm({ ...form, photo_url: url })}
                />
              </div>
              <Button type="submit" variant="plum" block disabled={saving}>
                {saving ? 'Saving…' : 'Save leader'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

export default AdminLeadership
