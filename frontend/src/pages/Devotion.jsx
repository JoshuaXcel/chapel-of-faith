import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import ComingSoon from '../components/ComingSoon.jsx'
import DevotionReading from '../components/DevotionReading.jsx'
import DevotionList from '../components/DevotionList.jsx'
import useFetch from '../useFetch.js'
import { publishedDevotions } from '../devotions.js'

function Devotion() {
  const { data, loading, error } = useFetch('/devotions')

  // Newest first: the first one is today's (or the latest), the rest are the archive
  const devotions = data ? publishedDevotions(data) : []
  const current = devotions[0]
  const older = devotions.slice(1)

  return (
    <>
      <section className="phero devotion-hero">
        <div className="wrap">
          <div className="crumb">
            <Link to="/">Home</Link>
            <Icon name="chevronRight" size={14} />
            <span>Daily devotion</span>
          </div>
          {loading && <Loading text="Loading today’s devotion…" />}
          <ErrorMessage message={error} />
          {data && !current && <p className="empty">No devotion has been posted yet.</p>}
          {current && <DevotionReading devotion={current} />}
        </div>
      </section>

      <section className="sec" id="subscribe">
        <div className="wrap split devotion-bottom">
          {/* Sign-up form: switched off until the backend can save subscribers */}
          <form className="card card-pad subscribe-card" onSubmit={(event) => event.preventDefault()}>
            <span className="icon-tile gold">
              <Icon name="mail" />
            </span>
            <h2 className="h3 mt20 big-h3">Start every day in the Word</h2>
            <p className="muted mt12">
              A short reading, a verse and a prayer from the Chaplaincy, every morning.
            </p>
            <fieldset className="stack g16 mt32" disabled>
              <div className="field">
                <label htmlFor="sub-name">Name</label>
                <input id="sub-name" className="input" placeholder="Your name" />
              </div>
              <div className="field">
                <label htmlFor="sub-email">Email</label>
                <input id="sub-email" className="input" type="email" placeholder="you@example.com" />
              </div>
              <Button type="submit" block>
                Subscribe
              </Button>
            </fieldset>
            <div className="mt16">
              <ComingSoon>Email sign-up is coming soon. Visit this page each morning for now.</ComingSoon>
            </div>
          </form>

          <div>
            <span className="eyebrow">Past devotions</span>
            <h2 className="h3 mt12 big-h3">Catch up on earlier days</h2>
            <div className="mt24">
              {data && <DevotionList devotions={older} />}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Devotion
