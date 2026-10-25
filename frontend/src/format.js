// Small helpers that turn backend dates into friendly text.
// The backend sends dates as text: "2026-10-04" (a date) or "2026-10-04T09:00:00" (date + time).

// "2026-10-04" -> a Date. new Date("2026-10-04") would read it as UTC midnight, which can
// show the day before in some time zones, so we build it from its parts instead.
function toDate(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }
  return new Date(value)
}

// "Sunday, 4 October 2026"
export function longDate(value) {
  return toDate(value).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// "4 Oct 2026"
export function shortDate(value) {
  return toDate(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

// "Thu 8 Oct"
export function dayMonth(value) {
  return toDate(value).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

// "9:00 AM"
export function time(value) {
  return toDate(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

// For the little date tiles: { day: "04", month: "Oct" }
export function dateTile(value) {
  const date = toDate(value)
  return {
    day: String(date.getDate()).padStart(2, '0'),
    month: date.toLocaleDateString('en-GB', { month: 'short' }),
  }
}

// "October 2026", used to group events by month
export function monthYear(value) {
  return toDate(value).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

// Today's date as "2026-10-25" in the visitor's own time zone
export function todayString() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
