import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import SermonPlayer from '../components/SermonPlayer.jsx'
import useFetch from '../useFetch.js'
import { shortDate } from '../format.js'

function Sermons() {
  const { data: sermons, loading, error } = useFetch('/sermons')
  const [search, setSearch] = useState('')

  // Keep only the sermons whose title, preacher or scripture contains the search text
  const words = search.trim().toLowerCase()
  const shown = (sermons || []).filter((sermon) => {
    const text = `${sermon.title} ${sermon.preacher} ${sermon.scripture || ''}`.toLowerCase()
    return text.includes(words)
  })

  return (
    <>
      <PageHeader
        crumb="Sermons"
        eyebrow="Messages"
        title={
          <>
            Sermon <em className="accent">library</em>
          </>
        }
        lead="Listen again, catch up on a message you missed, or share one with a friend."
      />

      <div className="wrap">
        {loading && <Loading text="Loading sermons…" />}
        <ErrorMessage message={error} />
      </div>

      {sermons && sermons.length === 0 && (
        <div className="wrap">
          <p className="empty">No sermons have been added yet.</p>
        </div>
      )}

      {sermons && sermons.length > 0 && (
        <>
          {/* The newest sermon is shown big at the top (the backend sends newest first) */}
          <section>
            <div className="wrap">
              <SermonPlayer sermon={sermons[0]} label="Newest message" />
            </div>
          </section>

          <section className="sec sermon-list">
            <div className="wrap">
              <div className="toolbar">
                <h3>All messages</h3>
                <label className="searchbox">
                  <Icon name="search" size={18} />
                  <input
                    type="search"
                    placeholder="Search messages"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
              </div>

              <div className="card list-card">
                <div className="rows">
                  {shown.map((sermon) => (
                    <Link key={sermon.id} className="row sermon-row" to={`/sermons/${sermon.id}`}>
                      <span className="minip">
                        <Icon name="play" size={18} />
                      </span>
                      <div>
                        <h4>{sermon.title}</h4>
                        <div className="s">
                          {sermon.preacher}
                          {sermon.scripture && ` · ${sermon.scripture}`}
                        </div>
                      </div>
                      <span className="small muted hm">{shortDate(sermon.preached_on)}</span>
                      <span className="chip chip-line hm">
                        <Icon name="headphones" size={14} />
                        {sermon.audio_url ? 'Audio' : 'Notes'}
                      </span>
                      <span className="row-arrow">
                        <Icon name="chevronRight" />
                      </span>
                    </Link>
                  ))}
                  {shown.length === 0 && <p className="muted row-empty">No sermons match “{search}”.</p>}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  )
}

export default Sermons
