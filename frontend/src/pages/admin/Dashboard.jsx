import { Link } from 'react-router-dom'
import Icon from '../../components/Icon.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import useFetch from '../../useFetch.js'
import { longDate, time, todayString } from '../../format.js'

// The first page after logging in: counts, shortcuts and what needs attention.
function Dashboard() {
  const events = useFetch('/events')
  const sermons = useFetch('/sermons')
  const devotions = useFetch('/devotions')
  const leaders = useFetch('/leadership')
  const gallery = useFetch('/gallery')

  // Shows "…" while a list is still loading
  function count(result) {
    return result.data ? result.data.length : '…'
  }

  const today = todayString()
  const todaysDevotion = devotions.data && devotions.data.find((d) => d.devotion_date === today)

  const stats = [
    { label: 'Upcoming events', icon: 'calendar', value: count(events), to: '/admin/events' },
    { label: 'Sermons', icon: 'headphones', value: count(sermons), to: '/admin/sermons' },
    { label: 'Devotions', icon: 'sun', value: count(devotions), to: '/admin/devotions' },
    { label: 'Leaders', icon: 'users', value: count(leaders), to: '/admin/leadership' },
  ]

  // Show the first error, if any list failed to load
  const error = events.error || sermons.error || devotions.error || leaders.error || gallery.error

  return (
    <>
      <div className="topbar">
        <div>
          <h1>Dashboard</h1>
          <p className="sub">Here is what is happening on the website.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="stat-grid mt16">
        {stats.map((stat) => (
          <Link key={stat.label} className="stat" to={stat.to}>
            <span className="k">
              {stat.label}
              <Icon name={stat.icon} size={18} />
            </span>
            <b>{stat.value}</b>
          </Link>
        ))}
      </div>

      {/* A reminder when nobody has written today's devotion yet */}
      {devotions.data && !todaysDevotion && (
        <div className="note warn mt20">
          <Icon name="bell" size={18} />
          <span>
            There is no devotion for today yet. <Link to="/admin/devotions">Write one now</Link>.
          </span>
        </div>
      )}

      <h2 className="dash-h">Quick actions</h2>
      <div className="qa">
        <Link to="/admin/devotions">
          <span className="icon-tile">
            <Icon name="pen" />
          </span>
          Write a devotion
        </Link>
        <Link to="/admin/sermons">
          <span className="icon-tile">
            <Icon name="mic" />
          </span>
          Add a sermon
        </Link>
        <Link to="/admin/events">
          <span className="icon-tile">
            <Icon name="calendar" />
          </span>
          Add an event
        </Link>
        <Link to="/admin/gallery">
          <span className="icon-tile">
            <Icon name="image" />
          </span>
          Add photos ({count(gallery)})
        </Link>
      </div>

      <div className="panel mt32">
        <div className="panel-h">
          <h3>Next events</h3>
          <Link className="link small" to="/admin/events">
            Manage events <Icon name="arrowRight" size={16} />
          </Link>
        </div>
        {events.data && events.data.length === 0 && (
          <p className="panel-empty">No upcoming events.</p>
        )}
        {events.data && events.data.length > 0 && (
          <div className="table-scroll">
            <table className="tbl">
              <tbody>
                {events.data.slice(0, 5).map((event) => (
                  <tr key={event.id}>
                    <td className="strong">{event.title}</td>
                    <td>
                      {longDate(event.starts_at)} · {time(event.starts_at)}
                    </td>
                    <td>{event.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default Dashboard
