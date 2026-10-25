import { useState } from 'react'
import Button from '../../components/Button.jsx'
import Icon from '../../components/Icon.jsx'
import Loading from '../../components/Loading.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import ImageUpload from './ImageUpload.jsx'
import useFetch from '../../useFetch.js'
import { del, mediaUrl, patch, post } from '../../api.js'
import { shortDate } from '../../format.js'

// What the form holds when adding a new photo ('' = empty, turned into null when saving)
const emptyForm = {
  image_url: '',
  caption: '',
}

function AdminGallery() {
  const { data: photos, loading, error, reload } = useFetch('/gallery')

  const [form, setForm] = useState(null) // null means the form is closed
  const [editingId, setEditingId] = useState(null) // null means "adding a new photo"
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  function startAdding() {
    setForm(emptyForm)
    setEditingId(null)
    setFormError('')
    setNotice('')
  }

  function startEditing(photo) {
    setForm({
      image_url: photo.image_url,
      caption: photo.caption || '',
    })
    setEditingId(photo.id)
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
    // A gallery entry is a photo, so the image is required
    if (!form.image_url) {
      setFormError('Please choose an image first.')
      return
    }
    setSaving(true)
    setFormError('')

    // What the backend expects (see GalleryImageCreate / GalleryImageUpdate in backend/app/schemas.py)
    const body = {
      image_url: form.image_url,
      caption: form.caption || null,
    }

    try {
      if (editingId) {
        await patch(`/gallery/${editingId}`, body)
        setNotice('Photo updated.')
      } else {
        await post('/gallery', body)
        setNotice('Photo added.')
      }
      closeForm()
      reload()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(photo) {
    if (!window.confirm('Delete this photo? This cannot be undone.')) return
    try {
      await del(`/gallery/${photo.id}`)
      setNotice('Photo deleted.')
      if (editingId === photo.id) closeForm()
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
          <h1>Gallery</h1>
          <p className="sub">Photos on the Gallery page. The newest five also appear on Home.</p>
        </div>
        <Button variant="plum" onClick={startAdding}>
          <Icon name="plus" /> Add photo
        </Button>
      </div>

      {notice && <p className="notice">{notice}</p>}

      <div className={form ? 'ed-grid' : ''}>
        <div className="panel">
          {loading && <Loading />}
          <ErrorMessage message={error} />
          {photos && photos.length === 0 && <p className="panel-empty">No photos yet.</p>}
          {photos && photos.length > 0 && (
            <div className="table-scroll">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Caption</th>
                    <th className="hide-m">Added</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {photos.map((photo) => (
                    <tr key={photo.id} className={editingId === photo.id ? 'sel' : ''}>
                      <td>
                        <img className="thumb" src={mediaUrl(photo.image_url)} alt="" />
                      </td>
                      <td className="strong">
                        {photo.caption || <span className="muted">No caption</span>}
                      </td>
                      <td className="hide-m">{shortDate(photo.created_at)}</td>
                      <td className="actions">
                        <button
                          className="btn btn-soft btn-sm"
                          type="button"
                          onClick={() => startEditing(photo)}
                        >
                          Edit
                        </button>
                        <button
                          className="iconbtn danger"
                          type="button"
                          onClick={() => handleDelete(photo)}
                          aria-label="Delete photo"
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
              <h3 className="drawer-title">{editingId ? 'Edit photo' : 'New photo'}</h3>
              <button className="iconbtn" type="button" onClick={closeForm} aria-label="Close form">
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="stack g16 mt20">
              <ErrorMessage message={formError} />
              <div className="field">
                <span className="field-label">Photo</span>
                <ImageUpload
                  value={form.image_url}
                  onChange={(url) => setForm({ ...form, image_url: url })}
                />
              </div>
              <div className="field">
                <label htmlFor="caption">
                  Caption <small>(optional)</small>
                </label>
                <input
                  id="caption"
                  name="caption"
                  className="input"
                  value={form.caption}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" variant="plum" block disabled={saving}>
                {saving ? 'Saving…' : 'Save photo'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

export default AdminGallery
