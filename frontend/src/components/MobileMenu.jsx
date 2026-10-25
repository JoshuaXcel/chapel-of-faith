import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'
import { SOCIAL_LINKS } from '../siteInfo.js'
import emblem from '../assets/emblem.png'
import './MobileMenu.css'

const links = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/about', label: 'About', icon: 'cross' },
  { to: '/ministries', label: 'Ministries', icon: 'users' },
  { to: '/sermons', label: 'Sermons', icon: 'headphones' },
  { to: '/events', label: 'Events', icon: 'calendar' },
  { to: '/devotion', label: 'Daily devotion', icon: 'sun' },
  { to: '/gallery', label: 'Gallery', icon: 'image' },
  { to: '/prayer', label: 'Prayer request', icon: 'message' },
  { to: '/contact', label: 'Contact', icon: 'mapPin' },
]

// Full-screen menu for phones. Navbar shows it when the menu button is tapped.
// Every link calls onClose, so the menu closes as the new page opens.
function MobileMenu({ onClose }) {
  return (
    <div className="mm" role="dialog" aria-label="Menu">
      <div className="mm-bar">
        <Link className="brand" to="/" onClick={onClose}>
          <img src={emblem} alt="" />
          <span className="bt">
            <b>The Chapel of Faith</b>
            <span>FUTA · Akure</span>
          </span>
        </Link>
        <button className="iconbtn mm-close" type="button" aria-label="Close menu" onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>

      <Link className="mm-live" to="/sermons" onClick={onClose}>
        <span className="flex g12">
          <span className="chip chip-dark">Off air</span>
          <b>Watch live</b>
        </span>
        <span className="small">Sun 9:00 AM</span>
      </Link>

      <nav className="mm-nav" aria-label="Mobile">
        {links.map((link) => (
          <Link key={link.to} to={link.to} onClick={onClose}>
            <span className="flex g16">
              <span className="mm-ico">
                <Icon name={link.icon} />
              </span>
              {link.label}
            </span>
            <Icon name="chevronRight" />
          </Link>
        ))}
      </nav>

      <div className="stack g12 mt32">
        <Link className="btn btn-gold btn-lg btn-block" to="/give" onClick={onClose}>
          <Icon name="heart" /> Give
        </Link>
        <Link className="btn btn-ghost-light btn-block" to="/prayer" onClick={onClose}>
          Request prayer
        </Link>
      </div>

      <div className="mm-social">
        {SOCIAL_LINKS.map((social) => (
          <a key={social.label} href={social.url} aria-label={social.label}>
            <Icon name={social.icon} />
          </a>
        ))}
      </div>
    </div>
  )
}

export default MobileMenu
