import Icon from './Icon.jsx'
import { longDate } from '../format.js'

// One devotion shown in full: date, title, scripture and the reading.
// Used by the Devotion page (today's) and the DevotionDetail page (older ones).
function DevotionReading({ devotion }) {
  // The body is plain text; blank lines separate paragraphs
  const paragraphs = devotion.body.split('\n').filter((line) => line.trim() !== '')

  return (
    <>
      <div className="reading center">
        <span className="chip chip-gold">
          <Icon name="calendar" size={14} /> {longDate(devotion.devotion_date)}
        </span>
        <h1 className="h1 mt24">{devotion.title}</h1>
        <p className="muted mt16">{devotion.author ? `By ${devotion.author}` : 'From the Chaplaincy'}</p>
      </div>
      <div className="reading mt40">
        <div className="scripture-big">{devotion.scripture}</div>
        {paragraphs.map((paragraph, index) => (
          // The paragraphs never change order, so the index is a safe key here
          <p key={index} className="body">
            {paragraph}
          </p>
        ))}
      </div>
    </>
  )
}

export default DevotionReading
