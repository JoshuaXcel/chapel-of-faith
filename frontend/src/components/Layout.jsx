import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'

// The frame around every public page: Navbar on top, Footer at the bottom.
// <Outlet /> is where React Router puts the page for the current URL.
function Layout() {
  const { pathname } = useLocation()

  // Start each new page at the top (React Router keeps the old scroll position otherwise)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default Layout
