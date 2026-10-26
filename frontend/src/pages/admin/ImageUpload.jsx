import { useState } from 'react'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import { mediaUrl, uploadImage } from '../../api.js'

// The backend accepts JPEG, PNG or WebP images up to 5 MB
const MAX_SIZE = 5 * 1024 * 1024

// Picks an image, uploads it to the backend (POST /images) and gives the form
// the saved address, e.g. "/media/abc.jpg", through onChange.
// value: the current image address ('' when there is none)
function ImageUpload({ value, onChange }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(event) {
    const file = event.target.files[0]
    event.target.value = '' // so choosing the same file again still triggers onChange
    if (!file) return

    // Check the size here first, so a big file fails fast without uploading
    if (file.size > MAX_SIZE) {
      setError('Image must be 5 MB or smaller.')
      return
    }

    setUploading(true)
    setError('')
    try {
      const data = await uploadImage(file)
      onChange(data.url)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload">
      {value ? (
        <img className="upload-preview" src={mediaUrl(value)} alt="Selected" />
      ) : (
        <div className="upload-empty">No image yet</div>
      )}
      <div className="flex g12 wrapx">
        {/* A <label> around a hidden file input works as a nice-looking button */}
        <label className="btn btn-outline btn-sm">
          {uploading ? 'Uploading…' : value ? 'Change image' : 'Choose image'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            disabled={uploading}
            onChange={handleFile}
          />
        </label>
        {value && (
          <button className="btn btn-soft btn-sm" type="button" onClick={() => onChange('')}>
            Remove
          </button>
        )}
      </div>
      <ErrorMessage message={error} />
    </div>
  )
}

export default ImageUpload
