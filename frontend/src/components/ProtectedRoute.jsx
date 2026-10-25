import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getToken } from '../api.js'

// Wraps the admin pages. Without a login token it sends the visitor to /admin/login.
// It also listens for "auth:logout" (sent by logout() in api.js), so logging out,
// or the token expiring, immediately returns to the login page.
function ProtectedRoute({ children }) {
  const [loggedIn, setLoggedIn] = useState(Boolean(getToken()))
  const location = useLocation()

  useEffect(() => {
    function handleLogout() {
      setLoggedIn(false)
    }
    window.addEventListener('auth:logout', handleLogout)
    // Stop listening when this component goes away
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  if (!loggedIn) {
    // "state" remembers where they wanted to go, so Login can send them back there
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedRoute
