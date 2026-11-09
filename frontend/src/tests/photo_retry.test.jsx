// Tests for Photo.jsx: when a photo fails to load, the placeholder shows, and a
// different photo given to the same box later must still show as a real picture.
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Photo from '../components/Photo.jsx'

describe('Photo', () => {
  it('shows the placeholder when the picture fails to load', () => {
    const { container } = render(<Photo src="http://example.test/broken.jpg" caption="Event banner" />)
    fireEvent.error(container.querySelector('img'))
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByText('Event banner')).toBeInTheDocument()
  })

  it('shows a new picture after the box is given a different address', () => {
    const { container, rerender } = render(
      <Photo src="http://example.test/broken.jpg" caption="Event banner" />,
    )
    fireEvent.error(container.querySelector('img'))

    // the next event has a good picture, so the same box must show it
    rerender(<Photo src="http://example.test/good.jpg" caption="Event banner" />)
    const img = container.querySelector('img')
    expect(img).not.toBeNull()
    expect(img).toHaveAttribute('src', 'http://example.test/good.jpg')
  })
})
