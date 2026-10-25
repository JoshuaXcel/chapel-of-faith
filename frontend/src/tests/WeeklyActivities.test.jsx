import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import WeeklyActivities from '../components/WeeklyActivities.jsx'

// Checks the "Weekly activities" section shows every day and time from siteInfo.js
describe('WeeklyActivities section', () => {
  it('shows the Sunday, Tuesday and Wednesday activities with their times', () => {
    // MemoryRouter is a pretend router, needed because the section has a link
    render(
      <MemoryRouter>
        <WeeklyActivities />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /every week/i })).toBeInTheDocument()

    // Find each day's card by its heading, then look only inside that card
    const card = (day) => screen.getByRole('heading', { name: day }).closest('article')

    const sunday = within(card('Sunday'))
    expect(sunday.getByText('Pre-service Prayer')).toBeInTheDocument()
    expect(sunday.getByText('8:00 AM')).toBeInTheDocument()
    expect(sunday.getByText('Bible Study')).toBeInTheDocument()
    expect(sunday.getByText('9:00 AM')).toBeInTheDocument()
    expect(sunday.getByText('Sunday Service')).toBeInTheDocument()
    expect(sunday.getByText('10:00 AM')).toBeInTheDocument()

    const tuesday = within(card('Tuesday'))
    expect(tuesday.getByText(/CYF/)).toBeInTheDocument()
    expect(tuesday.getByText('6:00 PM')).toBeInTheDocument()

    const wednesday = within(card('Wednesday'))
    expect(wednesday.getByText('Midweek Service')).toBeInTheDocument()
    expect(wednesday.getByText('5:00 PM')).toBeInTheDocument()
  })
})
