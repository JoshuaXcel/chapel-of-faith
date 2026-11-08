// heroSlides.js — the photos for the home page hero slideshow, in the order they show.
// Kept apart from the component so the component file only exports the component
// (the dev tools reload it cleanly). Python comparison: a module of constants, like a settings.py list.
import congregation from './assets/photos/hero/hero-01-congregation.jpg'
import campusAerial from './assets/photos/hero/hero-02-campus-aerial.jpg'
import praiseCrowd from './assets/photos/hero/hero-03-praise-crowd.jpg'
import cyfChoir from './assets/photos/hero/hero-04-cyf-choir.jpg'
import worshipLeader from './assets/photos/hero/hero-05-worship-leader.jpg'
import praying from './assets/photos/hero/hero-06-praying-church.jpg'

// The photos in the order they show. The first one is the wide Sunday congregation.
// position: which part of the photo stays in view when the photo is cropped to fit.
export const HERO_SLIDES = [
  { src: congregation, alt: 'The congregation seated for a Sunday service at the Chapel of Faith, FUTA', position: '50% 35%' },
  { src: campusAerial, alt: 'Aerial view of the Chapel of Faith building and campus at FUTA', position: '50% 50%' },
  { src: praiseCrowd, alt: 'Church members praising together at a Chapel of Faith service', position: '50% 30%' },
  { src: cyfChoir, alt: 'The CYF choir in robes singing during a Sunday service', position: '50% 30%' },
  { src: worshipLeader, alt: 'A worship leader lifting a hand in praise during a service', position: '50% 30%' },
  { src: praying, alt: 'Members of the church praying and worshipping together', position: '50% 30%' },
]

// How long each photo stays before the next one fades in (milliseconds)
export const HERO_INTERVAL_MS = 5500

