import { todayString } from './format.js'

// The backend lists every devotion, including ones written ahead for future dates.
// Visitors should only see today's and older ones.
export function publishedDevotions(devotions) {
  const today = todayString()
  // Dates look like "2026-10-25", so comparing them as text gives the right order
  return devotions.filter((devotion) => devotion.devotion_date <= today)
}

// Today's devotion, or the most recent one if nothing was written for today.
// The backend sends the list newest first, so that is the first one.
export function currentDevotion(devotions) {
  return publishedDevotions(devotions)[0] || null
}
