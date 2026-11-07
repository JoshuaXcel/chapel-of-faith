// HeroSlideshow.jsx — the full-width photo behind the home page hero.
// Several photos of the Chapel take turns, each one fading into the next behind the
// dimmed text. The first photo loads straight away; the rest start loading once it has
// arrived, so the page stays quick. A photo that fails to load is skipped, and if none
// load, the plain gradient behind the hero shows instead. A visitor whose device asks for
// less motion (the "reduce motion" setting) sees only the first photo, which does not move.
//
// Python comparison: this is a little like a generator that yields the next photo every
// few seconds (setInterval is the timer), with the state kept by React instead of a loop.
import { useEffect, useState } from 'react'
import { HERO_SLIDES, HERO_INTERVAL_MS } from '../heroSlides.js'

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

// Does the visitor's device ask for less motion? (jsdom may not have matchMedia, so guard it)
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(REDUCED_MOTION_QUERY).matches
  )
}

// The next photo after "from" that did not fail to load. Returns "from" if none is left.
// Python comparison: like next() over a list, skipping the items that are marked bad.
function nextWorking(from, failed, count) {
  for (let step = 1; step <= count; step += 1) {
    const candidate = (from + step) % count
    if (!failed[candidate]) return candidate
  }
  return from
}

function HeroSlideshow({ slides = HERO_SLIDES }) {
  // which photo is showing now (its place in the list), and the one it is fading in over
  const [turn, setTurn] = useState({ current: 0, previous: null })
  const active = turn.current
  // which photos could not load, keyed by their place in the list
  const [failed, setFailed] = useState({})
  // true once the first photo has arrived, so the rest may start loading
  const [restCanLoad, setRestCanLoad] = useState(false)
  // true when the visitor asked for less motion: then only the first photo loads and shows
  const [reduced, setReduced] = useState(prefersReducedMotion)

  // Follow the device setting if it changes while the page is open
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const query = window.matchMedia(REDUCED_MOTION_QUERY)
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  // Every few seconds, move on to the next photo that loaded
  useEffect(() => {
    if (reduced || slides.length < 2) return undefined
    const timer = setInterval(() => {
      setTurn((state) => {
        const next = nextWorking(state.current, failed, slides.length)
        // the old photo stays solid underneath while the new one fades in over it, so the middle of the fade does not go dark
        return next === state.current ? state : { current: next, previous: state.current }
      })
    }, HERO_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [reduced, failed, slides.length])

  // If the photo on screen fails, jump to a working one straight away
  const showing = failed[active] ? nextWorking(active, failed, slides.length) : active
  const onScreen = reduced ? 0 : showing

  return (
    <div className="hero-slides" aria-hidden="true">
      {slides.map((slide, index) => {
        // The first photo loads at once; the others get their address only after it has arrived
        const address = index === 0 || (restCanLoad && !reduced) ? slide.src : undefined
        let classes = 'hero-slide'
        if (index === onScreen && !failed[index]) classes += ' on'
        else if (index === turn.previous && !reduced) classes += ' prev'
        return (
          <img
            key={slide.src}
            className={classes}
            src={address}
            alt={slide.alt}
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'low'}
            decoding="async"
            style={{ objectPosition: slide.position }}
            onLoad={index === 0 ? () => setRestCanLoad(true) : undefined}
            onError={() => {
              setFailed((previous) => ({ ...previous, [index]: true }))
              if (index === 0) setRestCanLoad(true)
            }}
          />
        )
      })}
      {/* A dark wash over the photos, darkest behind the words on the left, so the text reads clearly */}
      <div className="hero-scrim" />
    </div>
  )
}

export default HeroSlideshow
