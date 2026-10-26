import { useParams } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import BackLink from '../components/BackLink.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import useFetch from '../useFetch.js'
import { mediaUrl } from '../api.js'
import { longDate } from '../format.js'

function SermonDetail() {
  // The ":id" part of the URL /sermons/:id (see App.jsx)
  const { id } = useParams()
  const { data: sermon, loading, error } = useFetch(`/sermons/${id}`)

  return (
    <section className="phero detail">
      <div className="wrap narrow">
        <BackLink to="/sermons">All sermons</BackLink>
        {loading && <Loading />}
        <ErrorMessage message={error} />

        {sermon && (
          <article className="mt32">
            <span className="eyebrow">Sermon</span>
            <h1 className="h1">{sermon.title}</h1>
            <div className="detail-meta">
              <span>
                <Icon name="mic" size={18} />
                {sermon.preacher}
              </span>
              <span>
                <Icon name="calendar" size={18} />
                {longDate(sermon.preached_on)}
              </span>
              {sermon.scripture && (
                <span>
                  <Icon name="book" size={18} />
                  {sermon.scripture}
                </span>
              )}
            </div>

            <div className="detail-audio">
              {sermon.audio_url ? (
                <audio controls preload="none" src={mediaUrl(sermon.audio_url)}>
                  Your browser cannot play this audio.
                </audio>
              ) : (
                <p className="muted">The recording for this message will be added soon.</p>
              )}
            </div>

            {sermon.description && <p className="detail-body">{sermon.description}</p>}
          </article>
        )}
      </div>
    </section>
  )
}

export default SermonDetail
