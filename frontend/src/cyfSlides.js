// cyfSlides.js — the photos behind the CYF (Chapel Youth Fellowship) section on the Ministries page,
// in the order they show. Like heroSlides.js, the list lives apart from the component.
// Python comparison: a module of constants, like a settings.py list.
import youthOne from './assets/photos/cyf/cyf-01.jpg'
import youthTwo from './assets/photos/cyf/cyf-02.jpg'
import youthThree from './assets/photos/cyf/cyf-03.jpg'

// The photos in the order they show.
// position: which part of the photo stays in view when the photo is cropped to fit.
export const CYF_SLIDES = [
  { src: youthOne, alt: 'Chapel Youth Fellowship (CYF) at the Chapel of Faith, FUTA', position: '50% 40%' },
  { src: youthTwo, alt: 'Chapel Youth Fellowship (CYF) at the Chapel of Faith, FUTA', position: '50% 30%' },
  { src: youthThree, alt: 'Chapel Youth Fellowship (CYF) at the Chapel of Faith, FUTA', position: '50% 40%' },
]
