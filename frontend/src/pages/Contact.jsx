import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'
import PageHeader from '../components/PageHeader.jsx'
import ComingSoon from '../components/ComingSoon.jsx'
import { CHURCH, SOCIAL_LINKS } from '../siteInfo.js'

// The ways to reach the Chapel. Values come from siteInfo.js; until they are
// filled in there, the card says "To be added".
const contactWays = [
  { icon: 'mail', title: 'Email', value: CHURCH.email, link: CHURCH.email && `mailto:${CHURCH.email}` },
  { icon: 'phone', title: 'Phone', value: CHURCH.phone, link: CHURCH.phone && `tel:${CHURCH.phone}` },
  {
    icon: 'whatsapp',
    title: 'WhatsApp',
    value: CHURCH.whatsapp,
    // wa.me links need the number with digits only
    link: CHURCH.whatsapp && `https://wa.me/${CHURCH.whatsapp.replace(/\D/g, '')}`,
  },
]

function Contact() {
  return (
    <>
      <PageHeader
        crumb="Contact"
        eyebrow="Contact"
        title={
          <>
            Come and <em className="accent">find us</em>
          </>
        }
        lead="The Chapel of Faith sits on the FUTA campus in Akure. Visitors are always welcome."
      />

      <section>
        <div className="wrap">
          <div className="map">
            {/* A Google Maps search for the Chapel, shown inside the page */}
            <iframe
              title="Map showing the Chapel of Faith, FUTA"
              src="https://www.google.com/maps?q=Chapel+of+Faith+FUTA+Akure&output=embed"
              loading="lazy"
            ></iframe>
          </div>
          <div className="flex between wrapx g16 mt24">
            <div>
              <h3>{CHURCH.venue}</h3>
              <p className="muted mt8">{CHURCH.address}</p>
            </div>
            <a className="btn btn-plum" href={CHURCH.mapsUrl} target="_blank" rel="noreferrer">
              <Icon name="mapPin" /> Open in Maps
            </a>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="contact-cards">
            {contactWays.map((way) => (
              <div key={way.title} className="cc">
                <span className="icon-tile">
                  <Icon name={way.icon} />
                </span>
                <h4>{way.title}</h4>
                {way.value ? (
                  <p>
                    <a href={way.link}>{way.value}</a>
                  </p>
                ) : (
                  <p className="ph-text">To be added</p>
                )}
              </div>
            ))}
          </div>

          <div className="split mt48 contact-split">
            <form className="card card-pad big-pad" onSubmit={(event) => event.preventDefault()}>
              <h3>Send a message</h3>
              <fieldset className="stack g16 mt24" disabled>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="contact-name">Name</label>
                    <input id="contact-name" className="input" placeholder="Your name" />
                  </div>
                  <div className="field">
                    <label htmlFor="contact-email">Email</label>
                    <input id="contact-email" className="input" type="email" placeholder="you@example.com" />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="contact-message">Message</label>
                  <textarea id="contact-message" className="input" placeholder="How can we help?" />
                </div>
                <Button type="submit" variant="plum" block>
                  Send message
                </Button>
              </fieldset>
              <div className="mt16">
                <ComingSoon>
                  The message form is coming soon. For now, visit the Chapel or use the details
                  above.
                </ComingSoon>
              </div>
            </form>

            <div className="stack g20">
              <div className="card-flat big-pad">
                <h4>Service times</h4>
                <dl className="kv mt20">
                  <dt>Sunday</dt>
                  <dd>9:00 AM · Sunday Service</dd>
                  <dt>Tuesday</dt>
                  <dd>6:00 PM · CYF Service</dd>
                  <dt>Midweek</dt>
                  <dd className="ph-text">To be announced</dd>
                </dl>
              </div>
              <div className="card card-pad flat-card">
                <h4>Follow the Chapel</h4>
                <div className="flex g12 mt20 wrapx">
                  {SOCIAL_LINKS.map((social) => (
                    <a key={social.label} className="btn btn-outline btn-sm" href={social.url}>
                      <Icon name={social.icon} /> {social.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Contact
