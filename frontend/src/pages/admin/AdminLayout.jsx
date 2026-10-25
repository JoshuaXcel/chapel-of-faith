import { Link, NavLink, Outlet } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import useFetch from '../../useFetch.js'
import { logout } from '../../api.js'
import emblem from '../../assets/emblem.png'
import './admin.css'

const links = [
  { to: '/admin', label: 'Dashboard', icon: 'home', end: true },
  { to: '/admin/events', label: 'Events', icon: 'calendar' },
  { to: '/admin/sermons', label: 'Sermons', icon: 'headphones' },
  { to: '/admin/devotions', label: 'Devotions', icon: 'sun' },
  { to: '/admin/leadership', label: 'Leadership', icon: 'users' },
  { to: '/admin/gallery', label: 'Gallery', icon: 'image' },
]

// The frame around every admin page: sidebar on the left, the page on the right.
function AdminLayout() {
  // Who is logged in. If the token is no longer valid this gets a 401,
  // and api.js logs the user out automatically.
  const { data: me } = useFetch('/auth/me')

  return (
    <div className="adm">
      <aside className="side">
        <Link className="brand" to="/admin">
          <img src={emblem} alt="" />
          <span className="bt">
            <b>Chapel of Faith</b>
            <span>Admin</span>
          </span>
        </Link>

        <span className="grp">Content</span>
        {links.map((link) => (
          // "end" makes Dashboard active only on /admin itself, not on /admin/events etc.
          <NavLink key={link.to} to={link.to} end={link.end}>
            <Icon name={link.icon} size={19} />
            {link.label}
          </NavLink>
        ))}

        <span className="grp">Website</span>
        <Link to="/" target="_blank">
          <Icon name="eye" size={19} />
          View site
        </Link>

        <div className="me">
          <span className="avatar">{me ? me.full_name.charAt(0) : '·'}</span>
          <div className="me-text">
            <b>{me ? me.full_name : '…'}</b>
            <span>{me ? me.role.replace('_', ' ') : ''}</span>
          </div>
          <button className="iconbtn" type="button" onClick={logout} aria-label="Log out" title="Log out">
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
