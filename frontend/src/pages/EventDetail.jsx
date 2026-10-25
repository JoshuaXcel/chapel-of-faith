import { useParams } from 'react-router-dom'
import BackLink from '../components/BackLink.jsx'
import Photo from '../components/Photo.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import useFetch from '../useFetch.js'
import { mediaUrl } from '../api.js'
import { longDate, time } from '../format.js'

function EventDetail() {
  // The ":id" part of the URL /events/:id (see App.jsx)
  const { id } = useParams()
  const { data: event, loading, error } = useFetch(`/events/${id}`)

  return (
    <section className="phero detail">
      <div className="wrap">
        <BackLink to="/events">All events</BackLink>
        {loading && <Loading />}
        <ErrorMessage message={error} />

        {event && (
          <article className="feature mt32">
            <Photo src={mediaUrl(event.image_url)} alt="" caption="Event banner" dark />
            <div className="fbody">
              <span className="eyebrow">Event</span>
              <h1 className="h2 mt16">{event.title}</h1>
              <dl className="kv mt32">
                <dt>Date</dt>
                <dd>{longDate(event.starts_at)}</dd>
                <dt>Time</dt>
                <dd>
                  {time(event.starts_at)}
                  {/* Only show the end time when the event has one */}
                  {event.ends_at && ` – ${time(event.ends_at)}`}
                </dd>
                <dt>Where</dt>
                <dd>{event.location}</dd>
              </dl>
              {event.description && <p className="detail-body">{event.description}</p>}
            </div>
          </article>
        )}
      </div>
    </section>
  )
}

export default EventDetail
