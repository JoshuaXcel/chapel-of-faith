// Tests for the photo slideshow (PhotoSlideshow.jsx), used by the pinned Home background and
// the CYF card: the first photo shows first, the photos take turns on a timer, a photo that
// fails is skipped, and a visitor who asked for less motion sees only the first photo.
import { render, act, fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PhotoSlideshow from '../components/PhotoSlideshow.jsx'
import { HERO_INTERVAL_MS, HERO_SLIDES } from '../heroSlides.js'
import { CYF_SLIDES } from '../cyfSlides.js'

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
  return Array.from(container.querySelectorAll('img.slideshow-slide'))
}

describe('PhotoSlideshow', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setReducedMotion(false)
  })

  afterEach(() => {
    vi.useRealTimers()
    delete window.matchMedia
  })

  it('renders one photo per slide and shows the first one', () => {
    const { container } = render(<PhotoSlideshow />)
    const imgs = photos(container)
    expect(imgs).toHaveLength(HERO_SLIDES.length)
    expect(imgs[0]).toHaveClass('on')
    expect(imgs[1]).not.toHaveClass('on')
    expect(imgs[0].getAttribute('alt')).toBe(HERO_SLIDES[0].alt)
  })

  it('shows the CYF photos when it is given the CYF slides', () => {
    const { container } = render(<PhotoSlideshow slides={CYF_SLIDES} className="cyf-slideshow" />)
    const imgs = photos(container)
    expect(imgs).toHaveLength(CYF_SLIDES.length)
    expect(imgs[0]).toHaveClass('on')
    expect(container.firstChild).toHaveClass('slideshow', 'cyf-slideshow')
  })

  it('starts the other photos loading only after the first one has arrived', () => {
    const { container } = render(<PhotoSlideshow />)
    const imgs = photos(container)
    expect(imgs[1]).not.toHaveAttribute('src')
    fireEvent.load(imgs[0])
    expect(photos(container)[1]).toHaveAttribute('src')
  })

  it('moves on to the next photo after each interval', () => {
    const { container } = render(<PhotoSlideshow />)
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

  it('uses the interval it is given, so the CYF card can turn at its own pace', () => {
    const { container } = render(<PhotoSlideshow slides={CYF_SLIDES} intervalMs={1000} />)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(photos(container)[1]).toHaveClass('on')
  })

  it('skips a photo that fails to load', () => {
    const { container } = render(<PhotoSlideshow />)
    fireEvent.error(photos(container)[1])
    act(() => {
      vi.advanceTimersByTime(HERO_INTERVAL_MS)
    })
    expect(photos(container)[2]).toHaveClass('on')
  })

  it('stays on the first photo, without moving, when the visitor asked for less motion', () => {
    setReducedMotion(true)
    const { container } = render(<PhotoSlideshow />)
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
