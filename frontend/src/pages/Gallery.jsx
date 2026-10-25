import PageHeader from '../components/PageHeader.jsx'
import Photo from '../components/Photo.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import useFetch from '../useFetch.js'
import { mediaUrl } from '../api.js'

function Gallery() {
  const { data: photos, loading, error } = useFetch('/gallery')

  return (
    <>
      <PageHeader
        crumb="Gallery"
        eyebrow="Our Chapel family"
        title={
          <>
            Faces of <em className="accent">faith</em>
          </>
        }
        lead="Moments from worship, fellowship and life together at the Chapel of Faith."
      />

      <section className="sec gallery-section">
        <div className="wrap">
          {loading && <Loading text="Loading photos…" />}
          <ErrorMessage message={error} />
          {photos && photos.length === 0 && <p className="empty">No photos have been added yet.</p>}
          {photos && photos.length > 0 && (
            <div className="photo-grid">
              {photos.map((photo) => (
                <figure key={photo.id}>
                  <Photo src={mediaUrl(photo.image_url)} alt={photo.caption || 'Chapel photo'} />
                  {photo.caption && <figcaption>{photo.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Gallery
