import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { CHURCH, weeklyActivities } from '../siteInfo.js'
import './WeeklyActivities.css'

// WeeklyActivities — the "Weekly activities" band on the Home page.
// It shows one card per day (Sunday, Tuesday, Wednesday) with each activity
// and its time. The days and times are NOT typed here: they come from
// `weeklyActivities` in siteInfo.js, so a time is changed in one place only.
//
// Layout: on wide screens the Sunday card (it has several activities) sits on
// the left and the one-activity days stack on its right. On phones every card
// stacks in one column (see WeeklyActivities.css).

// One icon per day, just for decoration. A day not listed gets the clock.
const dayIcons = {
  Sunday: 'sun',
  Tuesday: 'users',
  Wednesday: 'book',
}

function WeeklyActivities() {
  return (
    <section className="wa on-dark" aria-labelledby="wa-title">
      <div className="wrap">
        <div className="wa-head">
          <div>
            <span className="eyebrow">Weekly activities</span>
            <h2 id="wa-title" className="mt16">
              Worship with us {/* \u00a0 is a non-breaking space: keeps "every week" together on one line */}
              <em className="accent">every{'\u00a0'}week</em>
            </h2>
          </div>
          <p className="muted">
            Everyone is welcome: students, staff and visitors. All activities hold at the{' '}
            {CHURCH.venue}.
          </p>
        </div>

        <div className="wa-grid">
          {weeklyActivities.map((day) => (
            // "wa-day-multi" = a day with more than one activity (Sunday).
            // The CSS makes that card taller so it can hold its list.
            <article
              key={day.day}
              className={day.items.length > 1 ? 'wa-day wa-day-multi' : 'wa-day'}
            >
              <header className="wa-day-head">
                <span className="wa-ico">
                  <Icon name={dayIcons[day.day] || 'clock'} size={20} />
                </span>
                <div>
                  <h3 className="wa-day-name">{day.day}</h3>
                  <span className="wa-every">Every {day.day}</span>
                </div>
              </header>

              {/* The activities for this day, in time order */}
              <ul className="wa-list">
                {day.items.map((item) => (
                  <li key={item.name} className={item.main ? 'wa-item wa-main' : 'wa-item'}>
                    <div>
                      <span className="wa-name">{item.name}</span>
                      {item.note && <span className="wa-note">{item.note}</span>}
                    </div>
                    {/* <time> tells screen readers and search engines this is a time */}
                    <time className="wa-time">{item.time}</time>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="wa-foot">
          <span className="flex g8">
            <Icon name="mapPin" size={18} />
            {CHURCH.venue}, FUTA campus
          </span>
          <Link className="link" to="/contact">
            Get directions <Icon name="arrowRight" />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default WeeklyActivities
