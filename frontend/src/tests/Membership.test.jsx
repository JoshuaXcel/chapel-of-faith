import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Membership from '../pages/Membership.jsx'

// The membership form: required fields, validation, and a (pretend) submit.
// We replace the real fetch with a fake one (vi.fn) so no backend is needed.

function renderPage() {
  // MemoryRouter is a pretend router, needed because the page contains links
  render(
    <MemoryRouter>
      <Membership />
    </MemoryRouter>,
  )
}

afterEach(() => {
  vi.unstubAllGlobals() // put the real fetch back after each test
})

describe('Membership page', () => {
  it('shows the form with the required fields marked with *', () => {
    renderPage()

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^day/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^month/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/year \(optional\)/i)).toBeInTheDocument()
    // the four "I am a…" choices
    for (const name of ['Undergraduate', 'Graduate', 'Staff', 'Other']) {
      expect(screen.getByRole('radio', { name })).toBeInTheDocument()
    }
    // the red * after the label text
    expect(screen.getByText(/full name/i).querySelector('.req')).not.toBeNull()
    expect(screen.getByText(/phone \(whatsapp\)/i).querySelector('.req')).not.toBeNull()
    expect(screen.getByText(/i am a/i).querySelector('.req')).not.toBeNull()
    expect(screen.getByText(/^day/i, { selector: 'label' }).querySelector('.req')).not.toBeNull()
    expect(screen.getByText(/^month/i, { selector: 'label' }).querySelector('.req')).not.toBeNull()
  })

  it('shows department and level only for the right member type', async () => {
    renderPage()

    // nothing picked yet: no department or level boxes
    expect(screen.queryByLabelText(/department/i)).toBeNull()
    expect(screen.queryByLabelText(/level/i)).toBeNull()

    await userEvent.click(screen.getByRole('radio', { name: 'Undergraduate' }))
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/level/i)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('radio', { name: 'Graduate' }))
    expect(screen.getByLabelText(/course studied/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/level/i)).toBeNull()

    await userEvent.click(screen.getByRole('radio', { name: 'Staff' }))
    expect(screen.getByLabelText(/department/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/level/i)).toBeNull()

    await userEvent.click(screen.getByRole('radio', { name: 'Other' }))
    expect(screen.queryByLabelText(/department/i)).toBeNull()
    expect(screen.queryByLabelText(/course studied/i)).toBeNull()
    expect(screen.queryByLabelText(/level/i)).toBeNull()
  })

  it('does not send the form when the required fields are empty', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: /register as a member/i }))

    expect(screen.getByText('Please enter your full name.')).toBeInTheDocument()
    expect(screen.getByText('Please enter your phone number.')).toBeInTheDocument()
    expect(screen.getByText(/please choose one: undergraduate/i)).toBeInTheDocument()
    expect(screen.getByText('Please choose the day and month of your birthday.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('does not send a birthday that does not exist', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    await userEvent.type(screen.getByLabelText(/full name/i), 'Ada Okafor')
    await userEvent.type(screen.getByLabelText(/phone/i), '08012345678')
    await userEvent.click(screen.getByRole('radio', { name: 'Staff' }))
    await userEvent.selectOptions(screen.getByLabelText(/^day/i), '31')
    await userEvent.selectOptions(screen.getByLabelText(/^month/i), 'April')
    await userEvent.click(screen.getByRole('button', { name: /register as a member/i }))

    expect(screen.getByText(/31 April is not a real date/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('sends the details to POST /members and shows a thank-you message', async () => {
    // A fake backend answer: 201 Created with the saved member
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: 1, full_name: 'Ada Okafor', phone: '08012345678' }),
    })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    await userEvent.type(screen.getByLabelText(/full name/i), 'Ada Okafor')
    await userEvent.type(screen.getByLabelText(/phone/i), '08012345678')
    await userEvent.click(screen.getByRole('radio', { name: 'Undergraduate' }))
    await userEvent.selectOptions(screen.getByLabelText(/level/i), '300L')
    // 29 February is fine when the year is left empty
    await userEvent.selectOptions(screen.getByLabelText(/^day/i), '29')
    await userEvent.selectOptions(screen.getByLabelText(/^month/i), 'February')
    await userEvent.click(screen.getByRole('button', { name: /register as a member/i }))

    expect(await screen.findByText(/you've been registered/i)).toBeInTheDocument()

    // Check what was sent: the right address, and empty optional fields as null
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toMatch(/\/members$/)
    expect(options.method).toBe('POST')
    const sent = JSON.parse(options.body)
    expect(sent.full_name).toBe('Ada Okafor')
    expect(sent.phone).toBe('08012345678')
    expect(sent.member_type).toBe('undergraduate')
    expect(sent.level).toBe('300L')
    // the birthday is sent as numbers, and the empty year as null
    expect(sent.birth_day).toBe(29)
    expect(sent.birth_month).toBe(2)
    expect(sent.birth_year).toBeNull()
    expect(sent.email).toBeNull()
    expect(sent.joined_whatsapp_consent).toBe(false)
  })
})
