// Fixed church details used on several pages.
// Change them here once and every page that shows them updates.
// null means "not known yet": the pages then show a "to be added" note.
export const CHURCH = {
  name: 'The Chapel of Faith',
  place: 'FUTA · Akure',
  venue: 'Chapel of Faith Auditorium',
  address: 'Federal University of Technology, Akure, Ondo State, Nigeria',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Chapel+of+Faith+FUTA+Akure',
  email: null,
  phone: null,
  whatsapp: null,
}

// Social media pages. Replace '#' with the real page addresses.
export const SOCIAL_LINKS = [
  { label: 'Facebook', icon: 'facebook', url: '#' },
  { label: 'Instagram', icon: 'instagram', url: '#' },
  { label: 'YouTube', icon: 'youtube', url: '#' },
]

// What happens at the Chapel every week, day by day.
// This is the ONE place to change a time: the Home page, Footer, phone menu,
// Events, Contact and Ministries pages all read from this list.
//   day   = the full day name, shown as the card title
//   short = the 3-letter day, used where space is tight (e.g. "Sun")
//   items = the activities on that day, in time order
//     main: true marks the main Sunday service (shown as "Next service" on Home)
//     note: an optional short line shown under the activity name
export const weeklyActivities = [
  {
    day: 'Sunday',
    short: 'Sun',
    items: [
      { name: 'Pre-service Prayer', time: '8:00 AM' },
      { name: 'Bible Study', time: '9:00 AM' },
      { name: 'Sunday Service', time: '10:00 AM', main: true },
    ],
  },
  {
    day: 'Tuesday',
    short: 'Tue',
    items: [{ name: 'CYF Service', time: '6:00 PM', note: 'Chapel Youth Fellowship' }],
  },
  {
    day: 'Wednesday',
    short: 'Wed',
    items: [{ name: 'Midweek Service', time: '5:00 PM' }],
  },
]

// The main Sunday service, picked out of the list above, so pages that only
// show one time (the hero card, the phone menu) never disagree with it.
// Result looks like: { day: 'Sunday', short: 'Sun', name: 'Sunday Service', time: '10:00 AM' }
export const mainService = (() => {
  for (const day of weeklyActivities) {
    const item = day.items.find((activity) => activity.main)
    if (item) {
      return { day: day.day, short: day.short, name: item.name, time: item.time }
    }
  }
  return null
})()

// Every activity as one flat list, e.g. for the Footer and the Events page:
// [{ day: 'Sunday', short: 'Sun', name: 'Pre-service Prayer', time: '8:00 AM' }, ...]
export const allActivities = weeklyActivities.flatMap((day) =>
  day.items.map((item) => ({ day: day.day, short: day.short, ...item })),
)
