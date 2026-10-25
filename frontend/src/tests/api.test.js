import { describe, it, expect, vi, afterEach } from 'vitest'
import { API_URL, get, post, mediaUrl, saveToken, getToken } from '../api.js'

// Replace the real fetch with a fake one that returns the given answer
function fakeFetch(status, body) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('api.js', () => {
  it('calls the backend address and returns the data', async () => {
    const fetchMock = fakeFetch(200, [{ id: 1 }])

    const data = await get('/sermons')

    expect(data).toEqual([{ id: 1 }])
    expect(fetchMock.mock.calls[0][0]).toBe(`${API_URL}/sermons`)
  })

  it('adds the login token as a Bearer header', async () => {
    const fetchMock = fakeFetch(201, { id: 5 })
    saveToken('abc123')

    await post('/events', { title: 'Test' })

    const options = fetchMock.mock.calls[0][1]
    expect(options.headers.Authorization).toBe('Bearer abc123')
    expect(options.headers['Content-Type']).toBe('application/json')
    expect(options.body).toBe(JSON.stringify({ title: 'Test' }))
  })

  it('sends no Authorization header when nobody is logged in', async () => {
    const fetchMock = fakeFetch(200, [])

    await get('/events')

    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('turns a backend error into a readable message', async () => {
    fakeFetch(409, { detail: 'A devotion for that date already exists' })

    await expect(post('/devotions', {})).rejects.toThrow('A devotion for that date already exists')
  })

  it('turns a form error (422) into "field: problem"', async () => {
    fakeFetch(422, { detail: [{ loc: ['body', 'title'], msg: 'Field required' }] })

    await expect(post('/sermons', {})).rejects.toThrow('title: Field required')
  })

  it('logs out when the backend answers 401', async () => {
    fakeFetch(401, { detail: 'Could not validate credentials' })
    saveToken('expired-token')
    const onLogout = vi.fn()
    window.addEventListener('auth:logout', onLogout)

    await expect(get('/auth/me')).rejects.toThrow('Could not validate credentials')

    expect(getToken()).toBeNull()
    expect(onLogout).toHaveBeenCalled()
    window.removeEventListener('auth:logout', onLogout)
  })

  it('puts the backend address in front of /media image paths', () => {
    expect(mediaUrl('/media/photo.jpg')).toBe(`${API_URL}/media/photo.jpg`)
    expect(mediaUrl('https://example.com/a.jpg')).toBe('https://example.com/a.jpg')
    expect(mediaUrl(null)).toBeNull()
  })
})
