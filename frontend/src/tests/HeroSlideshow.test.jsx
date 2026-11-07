// Tests for the home page hero slideshow (HeroSlideshow.jsx): the first photo shows first,
// the photos take turns on a timer, and a visitor who asked for less motion sees only the first photo.
import { render, act, fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HeroSlideshow from '../components/HeroSlideshow.jsx'
import { HERO_INTERVAL_MS, HERO_SLIDES } from '../heroSlides.js'

// Makes window.matchMedia answer "reduce motion is on" (or off) for this test
function setReducedMotion(matches) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

// The photo elements in the order they were drawn
function photos(container) {
  return Array.from(container.querySelectorAll('img.hero-slide'))
}

describe('HeroSlideshow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setReducedMotion(false)
  })

  afterEach(() => {
    vi.useRealTimers()
    delete window.matchMedia
  })

  it('renders one photo per slide and shows the first one', () => {
    const { container } = render(<HeroSlideshow />)
    const imgs = photos(container)
    expect(imgs).toHaveLength(HERO_SLIDES.length)
    expect(imgs[0]).toHaveClass('on')
    expect(imgs[1]).not.toHaveClass('on')
    expect(imgs[0].getAttribute('alt')).toBe(HERO_SLIDES[0].alt)
  })

  it('starts the other photos loading only after the first one has arrived', () => {
    const { container } = render(<HeroSlideshow />)
    const imgs = photos(container)
    expect(imgs[1]).not.toHaveAttribute('src')
    fireEvent.load(imgs[0])
    expect(photos(container)[1]).toHaveAttribute('src')
  })

  it('moves on to the next photo after each interval', () => {
    const { container } = render(<HeroSlideshow />)
    act(() => {
      vi.advanceTimersByTime(HERO_INTERVAL_MS)
    })
    let imgs = photos(container)
    expect(imgs[0]).not.toHaveClass('on')
    expect(imgs[1]).toHaveClass('on')

    act(() => {
      vi.advanceTimersByTime(HERO_INTERVAL_MS)
    })
    imgs = photos(container)
    expect(imgs[2]).toHaveClass('on')
  })

  it('skips a photo that fails to load', () => {
    const { container } = render(<HeroSlideshow />)
    fireEvent.error(photos(container)[1])
    act(() => {
      vi.advanceTimersByTime(HERO_INTERVAL_MS)
    })
    expect(photos(container)[2]).toHaveClass('on')
  })

  it('stays on the first photo, without moving, when the visitor asked for less motion', () => {
    setReducedMotion(true)
    const { container } = render(<HeroSlideshow />)
    act(() => {
      vi.advanceTimersByTime(HERO_INTERVAL_MS * 3)
    })
    const imgs = photos(container)
    expect(imgs[0]).toHaveClass('on')
    expect(imgs[1]).not.toHaveClass('on')
    // the other photos are not even downloaded for this visitor
    expect(imgs[1]).not.toHaveAttribute('src')
  })
})
