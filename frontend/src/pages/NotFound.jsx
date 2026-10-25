import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'

// Shown for any URL that does not match a page (the "*" route in App.jsx)
function NotFound() {
  return (
    <section className="sec">
      <div className="wrap not-found">
        <span className="eyebrow plain">Error 404</span>
        <h1 className="h1 mt16">
          Page <em className="accent">not found</em>
        </h1>
        <p className="lead mt24">
          The page you are looking for does not exist or has moved. Let us take you back home.
        </p>
        <div className="flex g12 mt32 wrapx not-found-actions">
          <Button to="/">
            <Icon name="home" /> Go home
          </Button>
          <Button to="/events" variant="outline">
            See events
          </Button>
        </div>
      </div>
    </section>
  )
}

export default NotFound
