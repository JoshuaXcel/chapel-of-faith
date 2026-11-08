// Tests for the Home page's pinned background: the photo layer is drawn behind the whole page,
// and the other pages (here: About and Ministries) do not draw it.
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Home from '../pages/Home.jsx'
import About from '../pages/About.jsx'
import Ministries from '../pages/Ministries.jsx'

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

describe('pinned home background', () => {
  it('draws the photo layer behind the Home page, with the hero and the sections on top of it', () => {
    const { container } = renderPage(Home)
    const layer = container.querySelector('.pinned-bg')
    expect(layer).toBeInTheDocument()
    expect(layer.querySelectorAll('img.slideshow-slide').length).toBeGreaterThan(1)
    // the hero words are on the page too, after the layer
    expect(container.querySelector('.hero-section')).toBeInTheDocument()
    expect(container.querySelector('.home-page')).toContainElement(layer)
  })

  it('does not draw the photo layer on the About page', () => {
    const { container } = renderPage(About)
    expect(container.querySelector('.pinned-bg')).toBeNull()
    expect(container.querySelector('.slideshow')).toBeNull()
  })

  it('does not draw the photo layer on the Ministries page, which has its own CYF slideshow instead', () => {
    const { container } = renderPage(Ministries)
    expect(container.querySelector('.pinned-bg')).toBeNull()
    // the CYF card has its own slideshow
    expect(container.querySelector('.cyf-slideshow')).toBeInTheDocument()
  })
})
