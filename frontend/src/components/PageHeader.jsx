import { Link } from 'react-router-dom'
import Icon from './Icon.jsx'

// The title area at the top of every inner page:
// a small "Home > Page" trail, a label, a big heading and an intro sentence.
// title can contain an <em className="accent"> part for the purple italic word.
function PageHeader({ crumb, eyebrow, title, lead, children }) {
  return (
    <section className="phero">
      <div className="wrap">
        <div className="crumb">
          <Link to="/">Home</Link>
          <Icon name="chevronRight" size={14} />
          <span>{crumb}</span>
        </div>
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="h1">{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {children}
      </div>
    </section>
  )
}

export default PageHeader
