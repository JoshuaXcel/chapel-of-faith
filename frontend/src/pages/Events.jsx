import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import Photo from '../components/Photo.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import useFetch from '../useFetch.js'
import { mediaUrl } from '../api.js'
import { dateTile, longDate, monthYear, time } from '../format.js'
import { CHURCH, allActivities } from '../siteInfo.js'

// Activities that happen every week are fixed (not stored in the backend).
// They come from weeklyActivities in siteInfo.js, flattened into one list.

// Put events into groups by month: [{ month: "November 2026", events: [...] }, ...]
// The backend already sends them in date order, so we only start a new group
// when the month changes.
function groupByMonth(events) {
  const groups = []
  for (const event of events) {
    const month = monthYear(event.starts_at)
    const lastGroup = groups[groups.length - 1]
    if (lastGroup && lastGroup.month === month) {
      lastGroup.events.push(event)
    } else {
      groups.push({ month, events: [event] })
    }
  }
  return groups
}

function Events() {
  // The backend only returns events that have not started yet
  const { data: events, loading, error } = useFetch('/events')
  const featured = events && events[0]

  return (
    <>
      <PageHeader
        crumb="Events"
        eyebrow="Events & announcements"
        title={
          <>
            What&apos;s <em className="accent">coming up</em>
          </>
        }
        lead="Special programmes are announced here first, and on the Chapel’s Facebook and Instagram pages."
      />

      <div className="wrap">
        {loading && <Loading text="Loading events…" />}
        <ErrorMessage message={error} />
      </div>

      {/* The next event gets the big feature box */}
      {featured && (
        <section>
          <div className="wrap">
            <div className="feature">
              <Photo src={mediaUrl(featured.image_url)} alt="" caption="Event banner" dark />
              <div className="fbody">
                <span className="chip chip-gold">Next up</span>
                <h2 className="mt20">{featured.title}</h2>
                {featured.description && <p className="lead mt20">{featured.description}</p>}
                <dl className="kv mt32">
                  <dt>Date</dt>
                  <dd>{longDate(featured.starts_at)}</dd>
                  <dt>Time</dt>
                  <dd>
                    {time(featured.starts_at)}
                    {featured.ends_at && ` – ${time(featured.ends_at)}`}
                  </dd>
                  <dt>Where</dt>
                  <dd>{featured.location}</dd>
                </dl>
                <div className="flex g12 mt40 wrapx">
                  <Button to={`/events/${featured.id}`}>
                    Event details <Icon name="arrowRight" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="sec">
        <div className="wrap">
          <div className="month">Every week</div>
          <div className="stack g12">
            {allActivities.map((activity) => (
              <div key={activity.day + activity.name} className="ev-row">
                <span className="datetile gold">
                  <b>{activity.short}</b>
                  <span>Weekly</span>
                </span>
                <div>
                  <h3 className="ev-title">{activity.name}</h3>
                  <div className="ev-where">
                    <span className="flex g8">
                      <Icon name="clock" size={16} />
                      Every {activity.day} · {activity.time}
                    </span>
                    <span className="flex g8">
                      <Icon name="mapPin" size={16} />
                      {CHURCH.venue}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {events && events.length === 0 && (
            <>
              <div className="month">Special programmes</div>
              <p className="empty">No special programmes are planned right now. Check back soon.</p>
            </>
          )}

          {events &&
            groupByMonth(events).map((group) => (
              <div key={group.month}>
                <div className="month">{group.month}</div>
                <div className="stack g12">
                  {group.events.map((event) => {
                    const tile = dateTile(event.starts_at)
                    return (
                      <Link key={event.id} className="ev-row" to={`/events/${event.id}`}>
                        <span className="datetile">
                          <b>{tile.day}</b>
                          <span>{tile.month}</span>
                        </span>
                        <div>
                          <h3 className="ev-title">{event.title}</h3>
                          <div className="ev-where">
                            <span className="flex g8">
                              <Icon name="clock" size={16} />
                              {longDate(event.starts_at)} · {time(event.starts_at)}
                            </span>
                            <span className="flex g8">
                              <Icon name="mapPin" size={16} />
                              {event.location}
                            </span>
                          </div>
                        </div>
                        <span className="btn btn-outline btn-sm hm">Details</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
        </div>
      </section>
    </>
  )
}

export default Events
