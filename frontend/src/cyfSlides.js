// cyfSlides.js — the photos behind the CYF (Chapel Youth Fellowship) section on the Ministries page,
// in the order they show. Like heroSlides.js, the list lives apart from the component.
// All five are from the CYF Instagram post the church shared (see assets/CREDITS.md).
// Python comparison: a module of constants, like a settings.py list.
import youth01 from './assets/photos/cyf/cyf-01.jpg'
import youth02 from './assets/photos/cyf/cyf-02.jpg'
import youth03 from './assets/photos/cyf/cyf-03.jpg'
import youth04 from './assets/photos/cyf/cyf-04.jpg'
import youth05 from './assets/photos/cyf/cyf-05.jpg'

// The photos in the order they show.
// position: which part of the photo stays in view when the photo is cropped to fit.
export const CYF_SLIDES = [
  { src: youth01, alt: 'Young people of the Chapel Youth Fellowship (CYF) singing together on stage', position: '50% 40%' },
  { src: youth02, alt: 'Young people of the Chapel Youth Fellowship (CYF) singing together, with yellow flowers', position: '50% 30%' },
  { src: youth03, alt: 'Young people of the Chapel Youth Fellowship (CYF) singing on stage', position: '50% 30%' },
  { src: youth04, alt: 'Young people of the Chapel Youth Fellowship (CYF) singing on stage', position: '50% 30%' },
  { src: youth05, alt: 'Young people of the Chapel Youth Fellowship (CYF) gathered at a programme', position: '50% 35%' },
]
