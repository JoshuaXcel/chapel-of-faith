// Runs before every test file.
// Adds extra checks such as expect(element).toBeInTheDocument()
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Remove whatever the previous test drew on the page, and the saved login
afterEach(() => {
  cleanup()
  localStorage.clear()
})
