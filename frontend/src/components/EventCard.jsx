import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import Photo from './Photo.jsx'
import { mediaUrl } from '../api.js'
import { dateTile, longDate, time } from '../format.js'

// A card for one event: banner photo, date tile, title, date/time and place.
function EventCard({ event }) {
  const tile = dateTile(event.starts_at)
  return (
    <Link className="ev" to={`/events/${event.id}`}>
      <Photo src={mediaUrl(event.image_url)} alt="" caption="Event banner" />
      <div className="body">
        <span className="datetile">
          <b>{tile.day}</b>
          <span>{tile.month}</span>
        </span>
        <div>
          <h4>{event.title}</h4>
          <div className="where">
            <span>
              <Icon name="clock" size={16} />
              {longDate(event.starts_at)} · {time(event.starts_at)}
            </span>
            <span>
              <Icon name="mapPin" size={16} />
              {event.location}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default EventCard
