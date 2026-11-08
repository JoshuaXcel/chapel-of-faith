// Tests for the CYF card on the Ministries page: its slideshow shows the first youth photo first
// and turns on to the next one, and the heading and times sit on top of it.
import { render, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Ministries from '../pages/Ministries.jsx'
import { CYF_SLIDES } from '../cyfSlides.js'
import { HERO_INTERVAL_MS } from '../heroSlides.js'

vi.mock('../useFetch.js', () => ({
  default: () => ({ data: null, loading: false, error: null }),
}))

describe('CYF slideshow on the Ministries page', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  })

  afterEach(() => {
    vi.useRealTimers()
    delete window.matchMedia
  })

  it('shows the first CYF photo first, then turns on to the next one', () => {
    const { container } = render(
      <MemoryRouter>
        <Ministries />
      </MemoryRouter>,
    )
    const photos = () => Array.from(container.querySelectorAll('.cyf-slideshow img.slideshow-slide'))
    expect(photos()).toHaveLength(CYF_SLIDES.length)
    expect(photos()[0]).toHaveClass('on')

    act(() => {
      vi.advanceTimersByTime(HERO_INTERVAL_MS)
    })
    expect(photos()[1]).toHaveClass('on')
  })

  it('keeps the heading and the join button on top of the photos', () => {
    const { container } = render(
      <MemoryRouter>
        <Ministries />
      </MemoryRouter>,
    )
    const body = container.querySelector('.cyf-feature .cyf-body')
    expect(body).toHaveTextContent('Together we shall stand')
    expect(body.querySelector('a[href="#join"]')).toBeInTheDocument()
  })
})
