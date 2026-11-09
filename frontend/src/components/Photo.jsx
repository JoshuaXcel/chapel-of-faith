import { useState } from 'react'
import Icon from './Icon.jsx'

// Shows a photo, or a soft placeholder box with a caption when there is no photo yet.
// src: full image address (use mediaUrl() from api.js for images from the backend)
// If the image fails to load (a broken link, a slow network), the placeholder box shows
// instead, so a slot never shows a broken-image icon.
// In plain terms: useState is like a Python variable the component remembers between redraws.
function Photo({ src, alt = '', caption = 'Photo', dark = false, className = '' }) {
  // The address of the picture that failed to load (null when none has failed).
  // Remembering the address, not just "failed", means a different picture given to
  // this same box later gets its own try instead of staying as a placeholder.
  const [failedSrc, setFailedSrc] = useState(null)
  const failed = Boolean(src) && failedSrc === src

  let classes = 'ph'
  if (dark) classes += ' dark'
  if (className) classes += ` ${className}`

  if (src && !failed) {
    return (
      <div className={classes}>
        <img className="ph-img" src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} />
      </div>
    )
  }

  return (
    <div className={classes}>
      <span className="ph-cap">
        <Icon name="image" size={15} />
        {caption}
      </span>
    </div>
  )
}

export default Photo
