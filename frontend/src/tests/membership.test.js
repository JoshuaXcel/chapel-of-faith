import { describe, it, expect } from 'vitest'
import { birthdayText, daysInMonth, memberTypeLabel } from '../membership.js'

// The small membership helpers shared by the form and the admin Members page.

describe('membership.js', () => {
  it('writes a birthday with or without the year', () => {
    expect(birthdayText(12, 3, null)).toBe('12 March')
    expect(birthdayText(12, 3, 2004)).toBe('12 March 2004')
  })

  it('knows how many days each month has', () => {
    expect(daysInMonth(4)).toBe(30) // April
    expect(daysInMonth(2)).toBe(29) // February with no year: 29 is allowed
    expect(daysInMonth(2, 2003)).toBe(28)
    expect(daysInMonth(2, 2004)).toBe(29) // leap year
  })

  it('turns a member type into its label', () => {
    expect(memberTypeLabel('graduate')).toBe('Graduate')
    expect(memberTypeLabel(undefined)).toBe('—')
  })
})
