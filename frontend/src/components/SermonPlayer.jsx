import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { mediaUrl } from '../api.js'
import { longDate } from '../format.js'

// The dark purple card that shows one sermon, with an audio player when the
// sermon has a recording (audio_url). Used on the Home and Sermons pages.
function SermonPlayer({ sermon, label = 'Latest message' }) {
  return (
    <div className="player">
      <div>
        <span className="chip chip-dark">
          <Icon name="headphones" size={14} /> {label}
        </span>
        <Link className="title" to={`/sermons/${sermon.id}`}>
          {sermon.title}
        </Link>
        <div className="meta">
          <span>
            <Icon name="mic" size={16} />
            {sermon.preacher}
          </span>
          <span>
            <Icon name="calendar" size={16} />
            {longDate(sermon.preached_on)}
          </span>
          {sermon.scripture && (
            <span>
              <Icon name="book" size={16} />
              {sermon.scripture}
            </span>
          )}
        </div>
      </div>

      <div className="player-bottom">
        {sermon.audio_url ? (
          <audio className="audio" controls preload="none" src={mediaUrl(sermon.audio_url)}>
            Your browser cannot play this audio.
          </audio>
        ) : (
          <p className="player-note">The recording for this message will be added soon.</p>
        )}
        <Link className="btn btn-gold" to={`/sermons/${sermon.id}`}>
          Read more <Icon name="arrowRight" />
        </Link>
      </div>
    </div>
  )
}

export default SermonPlayer
