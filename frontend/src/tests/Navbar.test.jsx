import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

function renderNavbar() {
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  )
}

describe('Navbar', () => {
  it('has a link to every main page', () => {
    renderNavbar()
    const nav = screen.getByRole('navigation', { name: 'Main' })

    expect(within(nav).getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
    expect(within(nav).getByRole('link', { name: 'Sermons' })).toHaveAttribute('href', '/sermons')
    expect(within(nav).getByRole('link', { name: 'Events' })).toHaveAttribute('href', '/events')
    expect(within(nav).getByRole('link', { name: 'Devotion' })).toHaveAttribute('href', '/devotion')
  })

  it('has a Give button', () => {
    renderNavbar()
    expect(screen.getByRole('link', { name: 'Give' })).toHaveAttribute('href', '/give')
  })

  it('opens and closes the phone menu', async () => {
    renderNavbar()
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument()
  })
})
