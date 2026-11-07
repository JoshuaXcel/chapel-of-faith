// Tests for the opening splash: it shows once per browser session and is skipped
// when the visitor asks for reduced motion.
import { render, screen, act } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Splash from '../components/Splash.jsx'

describe('Splash', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the crest and name on the first visit', () => {
    render(<Splash />)
    expect(screen.getByRole('status', { name: /loading the chapel of faith/i })).toBeInTheDocument()
    expect(screen.getByText('The Chapel of Faith')).toBeInTheDocument()
  })

  it('goes away after its minimum time and remembers it ran for this session', () => {
    const { container } = render(<Splash />)
    // First the minimum time passes (the fade starts), then the fade itself
    act(() => {
      vi.advanceTimersByTime(1600)
    })
    act(() => {
      vi.advanceTimersByTime(600)
    })
    expect(container.querySelector('.splash')).toBeNull()
    expect(window.sessionStorage.getItem('chapel-splash-seen')).toBe('1')
  })

  it('does not show again once it has run this session', () => {
    window.sessionStorage.setItem('chapel-splash-seen', '1')
    const { container } = render(<Splash />)
    expect(container.querySelector('.splash')).toBeNull()
  })
})
