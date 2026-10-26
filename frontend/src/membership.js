// Everything the membership form and the admin Members page both need to know:
// the "I am a..." choices, the levels, the month names, and two small helpers
// for birthdays. Keeping it in one file means the form and the admin page can
// never disagree. The backend checks the same rules (MemberCreate in
// backend/app/schemas.py).

// The "I am a..." choices. `value` is what is sent to the backend and saved in
// the database; `label` is what people see.
export const memberTypes = [
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'staff', label: 'Staff' },
  { value: 'other', label: 'Other' },
]

// "staff" -> "Staff" (or "—" if the value is missing or unknown)
export function memberTypeLabel(value) {
  const type = memberTypes.find((item) => item.value === value)
  return type ? type.label : '—'
}

// Choices for the "Level" drop-down (only undergraduates have a level)
export const levels = ['100L', '200L', '300L', '400L', '500L']

export const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// How many days a month has. month is 1-12.
// Without a year we use 2000 (a leap year), so 29 February is allowed when the
// year is left empty. Day 0 of the next month is the last day of this month.
export function daysInMonth(month, year) {
  return new Date(year || 2000, month, 0).getDate()
}

// Birthday as text: "12 March", or "12 March 2004" when the year was given
export function birthdayText(day, month, year) {
  if (!day || !month) return '—'
  const text = `${day} ${monthNames[month - 1]}`
  return year ? `${text} ${year}` : text
}
