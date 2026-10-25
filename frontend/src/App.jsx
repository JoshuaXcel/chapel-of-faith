import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Ministries from './pages/Ministries.jsx'
import Sermons from './pages/Sermons.jsx'
import Events from './pages/Events.jsx'
import Devotion from './pages/Devotion.jsx'
import Gallery from './pages/Gallery.jsx'
import Give from './pages/Give.jsx'
import Prayer from './pages/Prayer.jsx'
import Contact from './pages/Contact.jsx'

// App decides which page to show for each URL.
// Pages inside the Layout route get the Navbar and Footer around them.
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/ministries" element={<Ministries />} />
        <Route path="/sermons" element={<Sermons />} />
        <Route path="/events" element={<Events />} />
        <Route path="/devotion" element={<Devotion />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/give" element={<Give />} />
        <Route path="/prayer" element={<Prayer />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
    </Routes>
  )
}

export default App
