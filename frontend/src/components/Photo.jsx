import Icon from './Icon.jsx'

// Shows a photo, or a soft placeholder box with a caption when there is no photo yet.
// src: full image address (use mediaUrl() from api.js for images from the backend)
function Photo({ src, alt = '', caption = 'Photo', dark = false, className = '' }) {
  let classes = 'ph'
  if (dark) classes += ' dark'
  if (className) classes += ` ${className}`

  if (src) {
    return (
      <div className={classes}>
        <img className="ph-img" src={src} alt={alt} loading="lazy" />
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
