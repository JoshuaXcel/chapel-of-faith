import Icon from './Icon.jsx'

// A small note for forms that cannot be sent yet.
// The backend has no endpoint for prayer requests, messages, counselling or
// devotion sign-ups yet, so those forms are shown but switched off.
function ComingSoon({ children }) {
  return (
    <div className="note">
      <Icon name="clock" size={18} />
      <span>{children}</span>
    </div>
  )
}

export default ComingSoon
