import { useEffect, useState } from 'react'
import { get } from './api.js'

// A small React hook that loads data from the backend for a page.
//
//   const { data, loading, error, reload } = useFetch('/sermons')
//
// - loading is true while waiting for the backend
// - error is a message to show if it failed ('' when it worked)
// - data is the backend's answer when it worked
// - reload() asks the backend again (admin pages use it after saving)
// It also loads again whenever "path" changes (for example /sermons/1 -> /sermons/2).
function useFetch(path) {
  // "version" goes up by one each time reload() is called
  const [version, setVersion] = useState(0)
  // The last answer, remembering which request it belongs to
  const [result, setResult] = useState({ request: null, data: null, error: '' })

  const request = `${path}#${version}`

  useEffect(() => {
    // If the page closes (or path changes) before the answer arrives, ignore the old answer
    let ignore = false

    get(path)
      .then((data) => {
        if (!ignore) setResult({ request, data, error: '' })
      })
      .catch((err) => {
        if (!ignore) setResult({ request, data: null, error: err.message })
      })

    return () => {
      ignore = true
    }
  }, [path, request])

  // Still loading if the answer we have is for a different (older) request
  const loading = result.request !== request

  return {
    data: loading ? null : result.data,
    loading,
    error: loading ? '' : result.error,
    reload: () => setVersion(version + 1),
  }
}

export default useFetch
