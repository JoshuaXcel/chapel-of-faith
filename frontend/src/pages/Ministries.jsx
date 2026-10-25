import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import Photo from '../components/Photo.jsx'
import PageHeader from '../components/PageHeader.jsx'
import ComingSoon from '../components/ComingSoon.jsx'

const cyfActivities = [
  { icon: 'book', label: 'Bible study' },
  { icon: 'music', label: 'Choir & music' },
  { icon: 'star', label: 'Drama' },
  { icon: 'send', label: 'Outreach' },
  { icon: 'heart', label: 'Prayer' },
  { icon: 'users', label: 'Socials' },
]

const units = [
  { icon: 'music', name: 'Choir', text: 'Lead the congregation in praise at every service.' },
  { icon: 'monitor', name: 'Media', text: 'Sound, livestream, photos and the Chapel’s online pages.' },
  { icon: 'star', name: 'Drama', text: 'Tell the gospel through stage and film.' },
  { icon: 'users', name: 'Ushering', text: 'Welcome every worshipper and keep services running well.' },
  { icon: 'heart', name: 'Prayer', text: 'Stand in the gap for the campus and the Chapel.' },
  { icon: 'send', name: 'Evangelism', text: 'Share the good news across the FUTA campus.' },
]

const counsellingAreas = [
  'Spiritual guidance & prayer',
  'Academic stress & exam anxiety',
  'Relationships, courtship & marriage',
  'Grief, loss & family matters',
  'Career & life direction',
]

function Ministries() {
  return (
    <>
      <PageHeader
        crumb="Ministries"
        eyebrow="Ministries & fellowships"
        title={
          <>
            Find your place <em className="accent">to belong</em>
          </>
        }
        lead="From the Chapel Youth Fellowship to counselling and service units, there is a way for everyone to grow and to serve."
      />

      <section>
        <div className="wrap">
          <div className="feature">
            <Photo caption="Photo: CYF fellowship" />
            <div className="fbody">
              <span className="eyebrow">CYF · Chapel Youth Fellowship</span>
              <h2 className="mt16">Together we shall stand</h2>
              <p className="lead mt20">
                The youth arm of the Chapel of Faith, FUTA: students growing in faith, gifts and
                friendship.
              </p>
              <dl className="kv mt32">
                <dt>Tuesdays</dt>
                <dd>6:00 PM · CYF Service</dd>
                <dt>Sundays</dt>
                <dd>9:00 AM · with the Chapel</dd>
                <dt>Where</dt>
                <dd>Chapel of Faith Auditorium</dd>
              </dl>
              <div className="taglist mt32">
                {cyfActivities.map((activity) => (
                  <span key={activity.label} className="tag">
                    <Icon name={activity.icon} size={16} />
                    {activity.label}
                  </span>
                ))}
              </div>
              <div className="flex g12 mt40 wrapx">
                <a className="btn btn-plum" href="#join">
                  Join CYF <Icon name="arrowRight" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" id="join">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Serve</span>
              <h2>Use your gifts</h2>
            </div>
            <p>Choose where you would love to serve, then speak to a unit leader after any service.</p>
          </div>
          <div className="min-grid">
            {units.map((unit) => (
              <div key={unit.name} className="min">
                <span className="icon-tile">
                  <Icon name={unit.icon} />
                </span>
                <h3>{unit.name}</h3>
                <p>{unit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec-sm counsel-section" id="counselling">
        <div className="wrap">
          <div className="counsel on-dark">
            <div>
              <span className="eyebrow light">Counselling</span>
              <h2 className="mt16">You don&apos;t have to carry it alone</h2>
              <p className="lead mt20 counsel-lead">
                The Chaplaincy offers a listening ear and godly counsel for students and staff, in
                person or by phone.
              </p>
              <div className="areas">
                {counsellingAreas.map((area) => (
                  <span key={area}>
                    <Icon name="check" size={18} />
                    {area}
                  </span>
                ))}
              </div>
              <div className="give-way mt32">
                <span className="ico">
                  <Icon name="shield" />
                </span>
                <div>
                  <b>Confidential</b>
                  <span>What you share stays between you and your counsellor.</span>
                </div>
              </div>
            </div>

            {/* The booking form is switched off until the backend can receive it */}
            <form className="formcard" onSubmit={(event) => event.preventDefault()}>
              <h3>Book a session</h3>
              <p className="small muted mt8">The Chaplaincy will confirm your slot.</p>
              <fieldset className="stack g16 mt24" disabled>
                <div className="field">
                  <label htmlFor="counsel-name">Your name</label>
                  <input id="counsel-name" className="input" placeholder="Full name" />
                </div>
                <div className="field">
                  <label htmlFor="counsel-area">Area</label>
                  <select id="counsel-area" className="input">
                    {counsellingAreas.map((area) => (
                      <option key={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="counsel-date">Preferred date</label>
                  <input id="counsel-date" className="input" type="date" />
                </div>
                <Button type="submit" block>
                  Request session
                </Button>
              </fieldset>
              <div className="mt16">
                <ComingSoon>
                  Online booking is coming soon. For now, speak to the Chaplaincy after any service.
                </ComingSoon>
              </div>
              <p className="tiny muted center mt16">
                If you are in danger right now, contact campus security or the FUTA Health Centre.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}

export default Ministries
