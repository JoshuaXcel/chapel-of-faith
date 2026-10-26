import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import Icon from './Icon.jsx'
import MobileMenu from './MobileMenu.jsx'
import emblem from '../assets/emblem.png'
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
          <Link className="livepill hide-m" to="/sermons">
            <span className="dot"></span>Watch live
          </Link>
          <Link className="btn btn-gold btn-sm" to="/give">
            Give
          </Link>
          {/* Only visible on phones (see Navbar.css) */}
          <button
            className="iconbtn menu-btn"
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </header>
  )
}

export default Navbar
