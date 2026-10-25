import Icon from './Icon.jsx'

// Shown when something went wrong, e.g. the backend is not running.
function ErrorMessage({ message }) {
  if (!message) return null
  return (
    <div className="error-box" role="alert">
      <Icon name="bell" size={18} />
      <span>{message}</span>
    </div>
  )
}

export default ErrorMessage
