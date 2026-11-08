// Tests for the Home page hero and where the photo slideshows appear: the slideshow sits behind
// the hero words only (not behind the whole page), and only the Home hero and the Ministries
// CYF card draw one. About draws none.
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Home from '../pages/Home.jsx'
import About from '../pages/About.jsx'
import Ministries from '../pages/Ministries.jsx'
import { HERO_SLIDES } from '../heroSlides.js'

// The pages fetch their data; these tests only look at the layout, so every fetch answers "nothing yet"
vi.mock('../useFetch.js', () => ({
  default: () => ({ data: null, loading: false, error: null }),
}))

function renderPage(Page) {
  return render(
    <MemoryRouter>
      <Page />
    </MemoryRouter>,
  )
}

describe('Home page hero', () => {
  it('draws the photo slideshow inside the hero, behind the hero words', () => {
    const { container } = renderPage(Home)
    const hero = container.querySelector('.hero-shell')
    const slideshow = hero.querySelector('.hero-slideshow')
    expect(slideshow).toBeInTheDocument()
    expect(slideshow.querySelectorAll('img.slideshow-slide')).toHaveLength(HERO_SLIDES.length)
    // the words and buttons are in the hero too, after the photos
    expect(hero.querySelector('h1')).toHaveTextContent('Chapel of Faith')
  })

  it('has no pinned background layer: the sections below are the normal page', () => {
    const { container } = renderPage(Home)
    expect(container.querySelector('.pinned-bg')).toBeNull()
    expect(container.querySelector('.home-page')).toBeNull()
  })
})

describe('where the photo slideshows appear', () => {
  it('does not draw a slideshow on the About page', () => {
    const { container } = renderPage(About)
    expect(container.querySelector('.slideshow')).toBeNull()
  })

  it('draws only the CYF slideshow on the Ministries page, not the hero one', () => {
    const { container } = renderPage(Ministries)
    expect(container.querySelector('.hero-slideshow')).toBeNull()
    expect(container.querySelector('.cyf-slideshow')).toBeInTheDocument()
  })
})
