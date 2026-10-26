import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/Button.jsx'
import ErrorMessage from '../../components/ErrorMessage.jsx'
import { getToken, post, saveToken } from '../../api.js'
import emblem from '../../assets/emblem.png'
import './admin.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Where to go after logging in: the admin page they tried to open, or the dashboard
  const goTo = (location.state && location.state.from) || '/admin'

  // Already logged in? Skip the form.
  if (getToken()) {
    return <Navigate to={goTo} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault() // stop the browser from reloading the page
    setError('')
    setSending(true)
    try {
      const data = await post('/auth/login', { email, password })
      saveToken(data.access_token)
      navigate(goTo, { replace: true })
    } catch (err) {
      setError(err.message)
      setSending(false)
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <Link className="brand" to="/">
          <img src={emblem} alt="Chapel of Faith crest" />
          <span className="bt">
            <b>The Chapel of Faith</b>
            <span>Staff area</span>
          </span>
        </Link>
        <h1 className="h3 mt32">Log in</h1>
        <p className="muted small mt8">For Chapel staff who update the website.</p>

        <div className="stack g16 mt24">
          <ErrorMessage message={error} />
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <Button type="submit" variant="plum" block disabled={sending}>
            {sending ? 'Logging in…' : 'Log in'}
          </Button>
        </div>
        <Link className="link small mt24" to="/">
          ← Back to the website
        </Link>
      </form>
    </div>
  )
}

export default Login
