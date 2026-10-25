import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import Photo from '../components/Photo.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import useFetch from '../useFetch.js'
import { mediaUrl } from '../api.js'
import emblem from '../assets/emblem.png'

const timeline = [
  {
    year: '1984',
    title: 'The Chapel is founded',
    text: 'The Chapel of Faith begins as the university’s interdenominational place of worship.',
  },
  {
    year: '2024',
    title: '40 years of worship',
    text: 'The Chapel marks four decades, remembered in “A Documentary of Chapel of Faith: 1984–2024”.',
  },
  {
    year: 'Today',
    title: 'Every background, one body',
    text: 'Sunday worship, CYF, counselling and daily devotions for students, staff and families.',
  },
]

const values = [
  { icon: 'cross', title: 'Interdenominational', text: 'Christians from every tradition worship together.' },
  { icon: 'mapPin', title: 'On the FUTA campus', text: 'A church home between lectures and labs.' },
  { icon: 'heart', title: 'All are welcome', text: 'Students, staff, families and visitors.' },
]

function About() {
  // Leaders come from the backend, already sorted by display_order
  const { data: leaders, loading, error } = useFetch('/leadership')

  // The first leader (lowest display order, e.g. the Chaplain) gets the big feature,
  // everyone else goes in the grid below
  const firstLeader = leaders && leaders[0]
  const otherLeaders = leaders ? leaders.slice(1) : []

  return (
    <>
      <PageHeader
        crumb="About"
        eyebrow="About the Chapel"
        title={
          <>
            One family of faith, <em className="accent">many traditions</em>
          </>
        }
        lead="The Chapel of Faith is the interdenominational church of the Federal University of Technology, Akure. Students, staff and families from every Christian background worship here together, on campus, as one body."
      />

      <section>
        <div className="wrap">
          <Photo className="about-photo" caption="Photo: the Chapel of Faith building" />
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Our story</span>
              <h2>Forty years of worship on the FUTA campus</h2>
            </div>
            <p>
              A place to pray between lectures, to find community far from home, and to grow in
              faith through every season of university life.
            </p>
          </div>
          <div className="timeline">
            {timeline.map((item) => (
              <div key={item.year} className="tl">
                <b>{item.year}</b>
                <h4>{item.title}</h4>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
          <div className="values mt24">
            {values.map((value) => (
              <div key={value.title} className="value">
                <span className="icon-tile">
                  <Icon name={value.icon} />
                </span>
                <div>
                  <h4>{value.title}</h4>
                  <p>{value.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec bg-white" id="leadership">
        <div className="wrap">
          {loading && <Loading text="Loading the leadership…" />}
          <ErrorMessage message={error} />
          {leaders && leaders.length === 0 && (
            <p className="empty">The leadership list will be added soon.</p>
          )}

          {firstLeader && (
            <div className="lead-person">
              <Photo src={mediaUrl(firstLeader.photo_url)} alt={firstLeader.name} caption="Photo" />
              <div>
                <span className="eyebrow">The Chaplaincy</span>
                <h2 className="mt16">Shepherding the campus</h2>
                <p className="lead mt24">
                  The Chaplaincy leads worship, pastoral care and counselling for the whole
                  university community.
                </p>
                <div className="card card-pad leader-card mt32">
                  <div className="flex g16">
                    <span className="icon-tile gold">
                      <Icon name="book" />
                    </span>
                    <div>
                      <div className="tiny muted label">{firstLeader.role}</div>
                      <h3 className="leader-name">{firstLeader.name}</h3>
                    </div>
                  </div>
                  {firstLeader.bio && <p className="muted mt16">{firstLeader.bio}</p>}
                </div>
                <div className="flex g12 mt32 wrapx">
                  <Button to="/ministries#counselling" variant="plum">
                    Book counselling
                  </Button>
                  <Button to="/contact" variant="outline">
                    Contact the Chaplaincy
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {otherLeaders.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow">Leadership</span>
                <h2>Council of Elders</h2>
              </div>
              <p>
                The Chapel Council and Council of Elders serve the congregation in every area of
                Chapel life.
              </p>
            </div>
            <div className="people">
              {otherLeaders.map((leader) => (
                <div key={leader.id} className="person">
                  <Photo src={mediaUrl(leader.photo_url)} alt={leader.name} caption="Photo" />
                  <span className="chip role">{leader.role}</span>
                  <h4>{leader.name}</h4>
                  {leader.bio && <p>{leader.bio}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="sec-sm motto-section">
        <div className="wrap">
          <div className="motto motto-center">
            <img src={emblem} alt="" />
            <div>
              <q>“The just shall live by his faith.”</q>
              <div className="ref mt12">Habakkuk 2:4</div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default About
