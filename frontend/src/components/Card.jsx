// A white box with a border and rounded corners.
// Add padded to get the standard inner spacing.
function Card({ padded = false, className = '', children }) {
  let classes = 'card'
  if (padded) classes += ' card-pad'
  if (className) classes += ` ${className}`
  return <div className={classes}>{children}</div>
}

export default Card
