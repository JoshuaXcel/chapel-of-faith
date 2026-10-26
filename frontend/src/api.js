// api.js: the one place where the frontend talks to the backend.
// Pages never call fetch() themselves. They call get(), post(), patch() or del() from here.
//
// What this file does for every request:
// 1. Puts the backend address (VITE_API_URL from the .env file) in front of the path.
// 2. Adds the admin login token, if there is one, as "Authorization: Bearer <token>".
// 3. Turns JSON into JavaScript objects and back.
// 4. Turns errors into a readable message (thrown as an Error), so pages can show it.

// "|| 'http://localhost:8000'" is a fallback for when .env is missing
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TOKEN_KEY = 'token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

// The backend stores uploaded files as "/media/abc.jpg" (a path on the backend).
// The browser needs the full address, e.g. "http://localhost:8000/media/abc.jpg".
// Full addresses (starting with http) are returned unchanged.
export function mediaUrl(path) {
  if (!path) return null
  if (path.startsWith('http')) return path // already a full address
  return API_URL + path
}

// Log out: forget the token and tell the app. ProtectedRoute.jsx listens for the
// "auth:logout" event and sends the user back to the login page.
// Used by the Log out button, and automatically when the backend answers 401.
export function logout() {
  clearToken()
  window.dispatchEvent(new Event('auth:logout'))
}

// FastAPI sends errors as { "detail": "..." }. For form errors (422) "detail" is a list,
// e.g. [{ loc: ["body", "title"], msg: "Field required" }]. Turn both into one sentence.
function readableError(status, body) {
  const detail = body && body.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((problem) => {
        const field = problem.loc ? problem.loc[problem.loc.length - 1] : ''
        return field ? `${field}: ${problem.msg}` : problem.msg
      })
      .join('. ')
  }
  if (status === 413) return 'That file is too large.'
  return `Something went wrong (error ${status}). Please try again.`
}

async function request(method, path, body) {
  const headers = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const options = { method, headers }
  if (body instanceof FormData) {
    // File uploads: the browser sets the right Content-Type itself
    options.body = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(API_URL + path, options)
  } catch {
    // fetch only fails like this when the backend cannot be reached at all
    throw new Error('Cannot reach the server. Is the backend running?')
  }

  // 204 No Content (e.g. after a delete) has no body to read
  const data = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    // A 401 on an admin request means the token expired or is wrong: log out.
    // (The login form itself also gets 401 for a wrong password, so skip that one.)
    if (response.status === 401 && token && path !== '/auth/login') {
      logout()
    }
    throw new Error(readableError(response.status, data))
  }

  return data
}

export function get(path) {
  return request('GET', path)
}

export function post(path, body) {
  return request('POST', path, body)
}

export function patch(path, body) {
  return request('PATCH', path, body)
}

// "delete" is a reserved word in JavaScript, so this one is called del
export function del(path) {
  return request('DELETE', path)
}

// Upload one image file. Returns the backend's answer: { url: "/media/<name>.jpg" }
export function uploadImage(file) {
  const form = new FormData()
  form.append('file', file) // the backend expects the field to be called "file"
  return post('/images', form)
}
