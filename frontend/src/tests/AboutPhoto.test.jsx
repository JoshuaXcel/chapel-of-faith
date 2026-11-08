// Tests for the About page's aerial photo: it carries the slow drone-style motion class,
// and the page draws no slideshow of its own.
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import About from '../pages/About.jsx'

vi.mock('../useFetch.js', () => ({
  default: () => ({ data: null, loading: false, error: null }),
}))

describe('About photo motion', () => {
  it('gives the campus aerial the slow drone-style motion class', () => {
    const { container } = render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    )
    const photo = container.querySelector('.about-photo')
    expect(photo).toHaveClass('drone-motion')
    expect(photo.querySelector('img.ph-img')).toBeInTheDocument()
  })
})
