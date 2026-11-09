// Tests for the phone menu (MobileMenu.jsx, opened from Navbar.jsx):
// the Escape key closes it, and keyboard focus moves into it when it opens.
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

function renderNavbar() {
  render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  )
}

describe('phone menu keyboard use', () => {
  it('closes when the Escape key is pressed', async () => {
    renderNavbar()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    expect(screen.getByRole('dialog', { name: 'Menu' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument())
  })

  it('moves focus into the menu when it opens', async () => {
    renderNavbar()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Open menu' }))

    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveFocus()
  })

  it('gives focus back to the menu button when it closes', async () => {
    renderNavbar()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Open menu' }))
    await user.click(screen.getByRole('button', { name: 'Close menu' }))

    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus()
  })
})
