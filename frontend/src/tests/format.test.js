import { describe, it, expect } from 'vitest'
import { dateTile, longDate, shortDate } from '../format.js'

describe('format.js', () => {
  it('shows a backend date in a friendly way', () => {
    expect(longDate('2026-10-04')).toBe('Sunday, 4 October 2026')
    expect(shortDate('2026-10-04')).toBe('4 Oct 2026')
  })

  it('makes the day and month for the date tiles', () => {
    expect(dateTile('2026-10-04T09:00:00')).toEqual({ day: '04', month: 'Oct' })
  })
})
