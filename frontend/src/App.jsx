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
import SermonDetail from './pages/SermonDetail.jsx'
import EventDetail from './pages/EventDetail.jsx'
import DevotionDetail from './pages/DevotionDetail.jsx'
import NotFound from './pages/NotFound.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/admin/Login.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'

// App decides which page to show for each URL.
// Public pages sit inside the Layout route, so they get the Navbar and Footer.
// Admin pages sit inside AdminLayout (sidebar) and need a login (ProtectedRoute).
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/ministries" element={<Ministries />} />
        <Route path="/sermons" element={<Sermons />} />
        {/* ":id" is a URL parameter: /sermons/3 shows the sermon with id 3 */}
        <Route path="/sermons/:id" element={<SermonDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/devotion" element={<Devotion />} />
        <Route path="/devotion/:id" element={<DevotionDetail />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/give" element={<Give />} />
        <Route path="/prayer" element={<Prayer />} />
        <Route path="/contact" element={<Contact />} />
        {/* "*" matches any other URL, so unknown pages show the 404 page */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Staff area. Everything under /admin needs a login, except the login page. */}
      <Route path="/admin/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* "index" = the page shown at /admin itself */}
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  )
}

export default App
