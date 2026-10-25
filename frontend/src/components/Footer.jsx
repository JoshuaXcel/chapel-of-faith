import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { CHURCH, SOCIAL_LINKS, allActivities } from '../siteInfo.js'
import emblem from '../assets/emblem.png'
import './Footer.css'

// Worked out once when the site loads, for the copyright line
const year = new Date().getFullYear()

function Footer() {
  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr-grid">
          <div>
            <Link className="brand" to="/">
              <img src={emblem} alt="" />
              <span className="bt">
                <b>The Chapel of Faith</b>
                <span>FUTA · Akure</span>
              </span>
            </Link>
            <p className="ftr-about">
              The interdenominational chapel of the Federal University of Technology, Akure. All
              are welcome.
            </p>
            <div className="soc">
              {SOCIAL_LINKS.map((social) => (
                <a key={social.label} href={social.url} aria-label={social.label}>
                  <Icon name={social.icon} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h5>Visit</h5>
            <ul>
              <li>{CHURCH.venue}</li>
              <li>FUTA campus, Akure</li>
              <li>Ondo State, Nigeria</li>
              <li>
                <Link className="link" to="/contact">
                  Get directions <Icon name="arrowRight" />
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5>Weekly activities</h5>
            {/* Comes from weeklyActivities in siteInfo.js */}
            <ul>
              {allActivities.map((activity) => (
                <li key={activity.day + activity.name}>
                  {activity.name} · {activity.short} {activity.time}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5>Quick links</h5>
            <ul>
              <li><Link to="/give">Give online</Link></li>
              <li><Link to="/prayer">Prayer request</Link></li>
              <li><Link to="/devotion">Daily devotion</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/admin">Staff login</Link></li>
            </ul>
          </div>
        </div>

        <div className="base">
          <span>© {year} The Chapel of Faith, FUTA</span>
          <span>“The just shall live by his faith” · Habakkuk 2:4</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
