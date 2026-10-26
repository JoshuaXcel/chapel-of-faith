// Shown while a page waits for the backend.
function Loading({ text = 'Loading…' }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" aria-hidden="true"></span>
      {text}
    </div>
  )
}

export default Loading
