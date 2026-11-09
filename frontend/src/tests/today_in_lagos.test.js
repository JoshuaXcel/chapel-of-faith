// Tests for todayString() in format.js: "today" for devotions must be the date in the
// church's own time zone (Africa/Lagos), not the date on the visitor's device.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { todayString } from '../format.js'

afterEach(() => {
  vi.useRealTimers()
})

describe('todayString', () => {
  it('uses the Lagos date when it is already the next day there', () => {
    // 23:30 UTC on 9 Nov is 00:30 on 10 Nov in Lagos (UTC+1)
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-09T23:30:00Z'))
    expect(todayString()).toBe('2026-11-10')
  })

  it('uses the Lagos date when it is still the day before there', () => {
    // 22:30 UTC on 9 Nov is 23:30 on 9 Nov in Lagos
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-09T22:30:00Z'))
    expect(todayString()).toBe('2026-11-09')
  })
})
