import { useEffect, useState } from 'react'
import emblem from '../assets/emblem.png'
import '../styles/splash.css'

// The opening screen: the Chapel crest, a spinning ring and a progress bar, then a fade
// into the site. Shown once per browser session (sessionStorage), so moving between
// pages does not replay it. It is skipped entirely when the visitor asks for less motion.
// Python comparison: it is a little like a FastAPI startup check that runs once per session.

const SEEN_KEY = 'chapel-splash-seen' // the sessionStorage key that remembers the splash ran
const MIN_MS = 1600 // how long the splash stays up at least (the progress bar runs for this long)
const FADE_MS = 500 // how long the fade-out takes (matches the CSS transition)

// Has this browser session already shown the splash? (sessionStorage can be blocked, so guard it)
function alreadySeen() {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

// Does the visitor's device ask for reduced motion? (jsdom may not have matchMedia, so guard it)
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function Splash() {
  // 'show' = on screen, 'fading' = fading out, 'done' = gone for good this session
  const [phase, setPhase] = useState(() =>
    alreadySeen() || prefersReducedMotion() ? 'done' : 'show',
  )

  // Start the timer when the splash first shows, and remember that it ran
  useEffect(() => {
    if (phase !== 'show') return undefined
    try {
      window.sessionStorage.setItem(SEEN_KEY, '1')
    } catch {
      // Storage blocked: the splash may show again on the next page, which is harmless
    }
    const timer = setTimeout(() => setPhase('fading'), MIN_MS)
    return () => clearTimeout(timer)
  }, [phase])

  // After the fade starts, remove the splash from the page once the fade has finished
  useEffect(() => {
    if (phase !== 'fading') return undefined
    const timer = setTimeout(() => setPhase('done'), FADE_MS)
    return () => clearTimeout(timer)
  }, [phase])

  if (phase === 'done') return null

  return (
    <div
      className={phase === 'fading' ? 'splash is-fading' : 'splash'}
      role="status"
      aria-label="Loading The Chapel of Faith"
    >
      <div className="splash-mark">
        <span className="splash-ring" aria-hidden="true"></span>
        <img className="splash-logo" src={emblem} alt="" />
      </div>
      <p className="splash-name">The Chapel of Faith</p>
      <div className="splash-bar" aria-hidden="true">
        <span></span>
      </div>
    </div>
  )
}

export default Splash
