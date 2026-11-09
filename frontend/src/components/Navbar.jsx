// Navbar.jsx: the top bar on every public page (logo, main links, Give, Watch live, and the
// menu button that opens the phone menu). Focus returns to the menu button when the menu closes.
import { useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon.jsx'
import MobileMenu from './MobileMenu.jsx'
import emblem from '../assets/emblem.png'
import { YOUTUBE_URL } from '../siteInfo.js'
import './Navbar.css'

// The links in the top bar. MobileMenu shows its own longer list on phones.
const links = [
  { to: '/about', label: 'About' },
  { to: '/ministries', label: 'Ministries' },
  { to: '/sermons', label: 'Sermons' },
  { to: '/events', label: 'Events' },
  { to: '/devotion', label: 'Devotion' },
  { to: '/contact', label: 'Contact' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  // the menu button, so focus goes back to it when the menu closes
  const menuButtonRef = useRef(null)

  function closeMenu() {
    setMenuOpen(false)
    menuButtonRef.current?.focus()
  }

  return (
    <header className="hdr">
      <div className="wrap bar">
        <Link className="brand" to="/">
          <img src={emblem} alt="Chapel of Faith crest" />
          <span className="bt">
            <b>The Chapel of Faith</b>
            <span>FUTA · Akure</span>
          </span>
        </Link>

        <nav className="nav" aria-label="Main">
          {links.map((link) => (
            // NavLink adds the "active" class to the link of the page we are on
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hdr-cta">
          {/* The livestream lives on the Chapel's YouTube channel, so this opens it in a new tab */}
          <a
            className="livepill hide-m"
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="dot"></span>Watch live
          </a>
          <Link className="btn btn-gold btn-sm" to="/give">
            Give
          </Link>
          {/* Only visible on phones (see Navbar.css) */}
          <button
            ref={menuButtonRef}
            className="iconbtn menu-btn"
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {menuOpen && <MobileMenu onClose={closeMenu} />}
    </header>
  )
}

export default Navbar
