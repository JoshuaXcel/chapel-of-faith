import Button from './Button.jsx'
import Icon from './Icon.jsx'

// MembershipBand — the "Make it official" call to action on the Home page.
// It invites regular worshippers to register as members and links to the
// membership form at /membership (pages/Membership.jsx).
// Styles are in styles/public.css under "Home: membership band".

// The three benefits listed on the right of the band
const benefits = [
  { icon: 'users', text: 'Added to the church membership records' },
  { icon: 'message', text: 'Joined to the official WhatsApp groups' },
  { icon: 'bell', text: 'Kept informed and involved as we grow' },
]

function MembershipBand() {
  return (
    <section className="sec-sm">
      <div className="wrap">
        <div className="member-band">
          <div>
            <span className="eyebrow">Membership</span>
            <h2 className="mt16">
              Been worshipping with us? <em className="accent">Make it official</em>
            </h2>
            <p className="lead mt16">
              Register as a member to be added to our church database and official WhatsApp
              groups. Stay connected, informed and involved as we grow together in faith.
            </p>
            <div className="mt32">
              <Button to="/membership" size="lg">
                Register as a member <Icon name="arrowRight" />
              </Button>
            </div>
          </div>

          <ul className="member-benefits">
            {benefits.map((benefit) => (
              <li key={benefit.text}>
                <span className="icon-tile gold">
                  <Icon name={benefit.icon} />
                </span>
                {benefit.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default MembershipBand
