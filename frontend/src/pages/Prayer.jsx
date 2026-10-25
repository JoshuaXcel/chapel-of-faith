import { Link } from 'react-router-dom'
import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import PageHeader from '../components/PageHeader.jsx'
import ComingSoon from '../components/ComingSoon.jsx'

function Prayer() {
  return (
    <>
      <PageHeader
        crumb="Prayer"
        eyebrow="Prayer requests"
        title={
          <>
            Let us <em className="accent">pray with you</em>
          </>
        }
        lead="“Is any among you afflicted? let him pray.” James 5:13. Your request goes straight to the Chaplain."
      />

      <section className="sec two-col-section">
        <div className="wrap two-col">
          {/* The form is switched off until the backend has a prayer request endpoint */}
          <form className="card card-pad big-pad" onSubmit={(event) => event.preventDefault()}>
            <h3>Send a prayer request</h3>
            <fieldset className="stack g20 mt24" disabled>
              <div className="field">
                <label htmlFor="prayer-name">
                  Name <small>(optional)</small>
                </label>
                <input id="prayer-name" className="input" placeholder="Your name" />
              </div>
              <div className="field">
                <label htmlFor="prayer-text">Your request</label>
                <textarea
                  id="prayer-text"
                  className="input"
                  placeholder="Share what you would like us to pray about…"
                />
              </div>
              <Button type="submit" size="lg" block>
                <Icon name="send" /> Send prayer request
              </Button>
            </fieldset>
            <div className="mt16">
              <ComingSoon>
                Online prayer requests are coming soon. Until then, please share your request with
                the Chaplaincy after any service, or see the Contact page.
              </ComingSoon>
            </div>
          </form>

          <div className="stack g20">
            <div className="card-flat big-pad">
              <h4>What happens next</h4>
              <div className="steps mt20">
                <div className="step">
                  <span className="n">1</span>
                  <p>Your request goes straight to the Chaplain.</p>
                </div>
                <div className="step">
                  <span className="n">2</span>
                  <p>The Chapel prayer team joins you in prayer.</p>
                </div>
                <div className="step">
                  <span className="n">3</span>
                  <p>Leave your name if you would like someone to follow up.</p>
                </div>
              </div>
            </div>
            <div className="card card-pad flat-card">
              <div className="flex g16 align-start">
                <span className="icon-tile gold">
                  <Icon name="shield" />
                </span>
                <div>
                  <h4>Need to talk to someone?</h4>
                  <p className="small muted mt8">
                    Book a confidential counselling session with the Chaplaincy.
                  </p>
                  <Link className="link mt12" to="/ministries#counselling">
                    Book counselling <Icon name="arrowRight" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Prayer
