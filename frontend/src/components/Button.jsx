import { Link } from 'react-router-dom'

// One button style for the whole site.
// - With "to" it is a link to another page:   <Button to="/give">Give</Button>
// - Without "to" it is a normal button:        <Button onClick={save}>Save</Button>
// variant: 'gold' (main action), 'plum', 'outline', 'soft' or 'ghost-light' (on dark backgrounds)
// size: 'sm', 'lg' or leave it out for the normal size
function Button({ to, variant = 'gold', size, block = false, className = '', children, ...rest }) {
  let classes = `btn btn-${variant}`
  if (size) classes += ` btn-${size}`
  if (block) classes += ' btn-block'
  if (className) classes += ` ${className}`

  if (to) {
    return (
      <Link className={classes} to={to} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} type="button" {...rest}>
      {children}
    </button>
  )
}

export default Button
