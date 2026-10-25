import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import Photo from '../components/Photo.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import EventCard from '../components/EventCard.jsx'
import WeeklyActivities from '../components/WeeklyActivities.jsx'
import SermonPlayer from '../components/SermonPlayer.jsx'
import useFetch from '../useFetch.js'
import { mediaUrl } from '../api.js'
import { currentDevotion } from '../devotions.js'
import { dayMonth } from '../format.js'
import { mainService } from '../siteInfo.js'
import emblem from '../assets/emblem.png'

// The "I want to…" shortcut tiles
const paths = [
  { to: '/contact', label: 'Plan a visit', icon: 'compass' },
  { to: '/sermons', label: 'Watch online', icon: 'monitor' },
  { to: '/prayer', label: 'Request prayer', icon: 'message' },
  { to: '/give', label: 'Give', icon: 'heart' },
  { to: '/ministries', label: 'Join CYF', icon: 'users' },
  { to: '/ministries#counselling', label: 'Book counselling', icon: 'shield' },
]

function Home() {
  // Each section loads its own data, so one failing does not break the others
  const sermons = useFetch('/sermons')
  const devotions = useFetch('/devotions')
  const events = useFetch('/events')
  const gallery = useFetch('/gallery')

  const latestSermon = sermons.data && sermons.data[0]
  const devotion = devotions.data && currentDevotion(devotions.data)

  return (
    <>
      {/* Hero */}
      <section>
        <div className="hero-shell">
          {/* The three thin gold circles in the corner are only decoration */}
          <span className="ring ring-1"></span>
          <span className="ring ring-2"></span>
          <span className="ring ring-3"></span>
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow light">
                Interdenominational · Federal University of Technology, Akure
              </span>
              <h1 className="display hero-title">
                Welcome home to the <em className="accent">Chapel of Faith</em>
              </h1>
              <p className="lead">
                One family of faith from many traditions, worshipping together on the FUTA campus
                since 1984. Students, staff and families: there is a seat for you.
              </p>
              <div className="hero-actions">
                <Button to="/contact" size="lg">
                  Plan a visit <Icon name="compass" />
                </Button>
                <Button to="/sermons" variant="ghost-light" size="lg">
                  <Icon name="play" /> Watch live
                </Button>
              </div>
              <div className="verse-strip">
                <q>“The just shall live by his faith.”</q>
                <span>Habakkuk 2:4 · our motto</span>
              </div>
            </div>
            <div className="hero-media">
              <Photo dark caption="Photo: the congregation at Sunday worship" />
              <div className="float-card">
                <span className="datetile">
                  <b>{mainService.short}</b>
                  {/* "10:00 AM" -> "10:00": the tile is too small for AM/PM */}
                  <span>{mainService.time.replace(/ (AM|PM)$/, '')}</span>
                </span>
                <div>
                  <div className="tiny muted label">Next service</div>
                  <div className="float-title">
                    {mainService.name} · {mainService.time}
                  </div>
                  <div className="small muted">Chapel of Faith Auditorium</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly activities: every day's activities and times (from siteInfo.js) */}
      <WeeklyActivities />

      {/* Shortcuts */}
      <section className="sec-sm paths-section">
        <div className="wrap">
          <h3 className="paths-title">I want to…</h3>
          <div className="paths">
            {paths.map((path) => (
              <Link key={path.label} className="path" to={path.to}>
                <span className="ico">
                  <Icon name={path.icon} />
                </span>
                <b>
                  {path.label}
                  <Icon name="arrowRight" />
                </b>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest sermon + today's devotion */}
      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">This week</span>
              <h2>Listen again, then start each day in the Word</h2>
            </div>
            <Button to="/sermons" variant="outline">
              All messages <Icon name="arrowRight" />
            </Button>
          </div>

          <div className="sermon-feature">
            <div>
              {sermons.loading && <Loading />}
              <ErrorMessage message={sermons.error} />
              {latestSermon && <SermonPlayer sermon={latestSermon} />}
              {sermons.data && !latestSermon && <p className="empty">No sermons yet.</p>}
            </div>

            <div className="dev-card">
              <div className="dev-date">
                <span className="eyebrow plain">Today&apos;s devotion</span>
                {devotion && <span className="chip chip-gold">{dayMonth(devotion.devotion_date)}</span>}
              </div>
              {devotions.loading && <Loading />}
              <ErrorMessage message={devotions.error} />
              {devotions.data && !devotion && <p className="muted">No devotion has been posted yet.</p>}
              {devotion && (
                <>
                  <h3>{devotion.title}</h3>
                  <div className="scripture">{devotion.scripture}</div>
                  {/* Only the first paragraph here; the full text is on the Devotion page */}
                  <p className="small dev-excerpt">{devotion.body.split('\n')[0]}</p>
                  <div className="flex g12 dev-actions">
                    <Button to="/devotion" variant="plum" size="sm">
                      Read today&apos;s devotion
                    </Button>
                    <Link className="link" to="/devotion">
                      Past devotions
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming events */}
      <section className="sec bg-white">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Events</span>
              <h2>What&apos;s coming up</h2>
            </div>
            <p>
              Special programmes are announced here first, and on the Chapel&apos;s Facebook and
              Instagram pages.
            </p>
          </div>
          {events.loading && <Loading />}
          <ErrorMessage message={events.error} />
          {events.data && events.data.length === 0 && (
            <p className="empty">No upcoming events right now. Check back soon.</p>
          )}
          {events.data && events.data.length > 0 && (
            <div className="ev-grid">
              {/* Only the next three events on the home page */}
              {events.data.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
          <div className="center mt40">
            <Button to="/events" variant="outline">
              See all events <Icon name="arrowRight" />
            </Button>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="sec">
        <div className="wrap about-grid">
          <div>
            <span className="eyebrow">About the Chapel</span>
            <h2 className="mt16">One family of faith, many traditions</h2>
            <p className="lead mt24">
              The Chapel of Faith is the interdenominational church of the Federal University of
              Technology, Akure. Students, staff and families from every Christian background
              worship here together, as one body.
            </p>
            <div className="facts">
              <div>
                <b>1984</b>
                <span>Founded</span>
              </div>
              <div>
                <b>40 years</b>
                <span>Marked in 2024</span>
              </div>
              <div>
                <b>One</b>
                <span>Body in Christ</span>
              </div>
            </div>
            <Button to="/about" variant="outline" className="mt40">
              Our story <Icon name="arrowRight" />
            </Button>
          </div>
          <div className="motto">
            <img src={emblem} alt="Chapel of Faith crest" />
            <div>
              <q>“The just shall live by his faith.”</q>
              <div className="ref mt12">Habakkuk 2:4 · the motto on our crest</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="sec bg-sand">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Our Chapel family</span>
              <h2>Faces of faith</h2>
            </div>
            <Link className="link" to="/gallery">
              See the gallery <Icon name="arrowRight" />
            </Link>
          </div>
          {gallery.loading && <Loading />}
          <ErrorMessage message={gallery.error} />
          {gallery.data && gallery.data.length === 0 && <p className="empty">No photos yet.</p>}
          {gallery.data && gallery.data.length > 0 && (
            <div className="gal">
              {/* The first photo is shown big, the next four small */}
              {gallery.data.slice(0, 5).map((photo) => (
                <Photo
                  key={photo.id}
                  src={mediaUrl(photo.image_url)}
                  alt={photo.caption || 'Chapel photo'}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Giving */}
      <section className="sec">
        <div className="wrap">
          <div className="give-band">
            <div>
              <span className="eyebrow light">Giving</span>
              <blockquote className="mt24">
                “Every man according as he purposeth in his heart, so let him give… for God loveth a
                cheerful giver.”
              </blockquote>
              <div className="mt16 give-ref">2 Corinthians 9:7</div>
              <div className="hero-actions">
                <Button to="/give" size="lg">
                  Give now <Icon name="arrowRight" />
                </Button>
              </div>
            </div>
            <div className="give-ways">
              <div className="give-way">
                <span className="ico">
                  <Icon name="heart" />
                </span>
                <div>
                  <b>Tithe</b>
                  <span>The first fruit of your increase</span>
                </div>
              </div>
              <div className="give-way">
                <span className="ico">
                  <Icon name="gift" />
                </span>
                <div>
                  <b>Offering &amp; gifts</b>
                  <span>Thanksgiving and special gifts</span>
                </div>
              </div>
              <div className="give-way">
                <span className="ico">
                  <Icon name="bank" />
                </span>
                <div>
                  <b>Building fund</b>
                  <span>For the Chapel&apos;s projects</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
