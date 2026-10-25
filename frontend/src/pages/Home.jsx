import Button from '../components/Button.jsx'
import Icon from '../components/Icon.jsx'

// Temporary home page; the real sections are added in the next steps.
function Home() {
  return (
    <section className="sec">
      <div className="wrap">
        <span className="eyebrow">Interdenominational · FUTA</span>
        <h1 className="display mt24">
          Welcome home to the <em className="accent">Chapel of Faith</em>
        </h1>
        <p className="lead mt24">The new website is being built.</p>
        <div className="flex g12 mt32">
          <Button size="lg">
            Plan a visit <Icon name="compass" />
          </Button>
          <Button variant="outline" size="lg">
            Watch online
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Home
