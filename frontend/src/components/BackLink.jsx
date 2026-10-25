import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'

// "← Back to sermons" style link used at the top of detail pages
function BackLink({ to, children }) {
  return (
    <Link className="link back-link" to={to}>
      <Icon name="chevronLeft" size={18} />
      {children}
    </Link>
  )
}

export default BackLink
