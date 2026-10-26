import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { dateTile } from '../format.js'

// A list of devotions (date tile, title, scripture), each linking to its own page.
function DevotionList({ devotions }) {
  if (devotions.length === 0) {
    return <p className="muted">No other devotions yet.</p>
  }

  return (
    <div className="card list-card">
      <div className="rows">
        {devotions.map((devotion) => {
          const tile = dateTile(devotion.devotion_date)
          return (
            <Link key={devotion.id} className="row devotion-row" to={`/devotion/${devotion.id}`}>
              <span className="datetile">
                <b>{tile.day}</b>
                <span>{tile.month}</span>
              </span>
              <div>
                <h4>{devotion.title}</h4>
                <div className="small muted">{devotion.scripture}</div>
              </div>
              <Icon name="chevronRight" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default DevotionList
