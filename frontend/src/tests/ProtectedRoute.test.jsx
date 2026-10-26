import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute.jsx'
import { saveToken } from '../api.js'

// Pretend the visitor opened /admin
function renderAdmin() {
  render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin/login" element={<p>Login page</p>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <p>Secret admin page</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('sends visitors without a login to the login page', () => {
    renderAdmin()
    expect(screen.getByText('Login page')).toBeInTheDocument()
    expect(screen.queryByText('Secret admin page')).not.toBeInTheDocument()
  })

  it('shows the admin page when logged in', () => {
    saveToken('some-token')
    renderAdmin()
    expect(screen.getByText('Secret admin page')).toBeInTheDocument()
  })
})
