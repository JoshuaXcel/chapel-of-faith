import { useParams } from 'react-router-dom'
import BackLink from '../components/BackLink.jsx'
import Loading from '../components/Loading.jsx'
import ErrorMessage from '../components/ErrorMessage.jsx'
import DevotionReading from '../components/DevotionReading.jsx'
import useFetch from '../useFetch.js'

function DevotionDetail() {
  // The ":id" part of the URL /devotion/:id (see App.jsx)
  const { id } = useParams()
  const { data: devotion, loading, error } = useFetch(`/devotions/${id}`)

  return (
    <section className="phero detail">
      <div className="wrap">
        <BackLink to="/devotion">Today&apos;s devotion</BackLink>
        {loading && <Loading />}
        <ErrorMessage message={error} />
        {devotion && (
          <div className="mt32">
            <DevotionReading devotion={devotion} />
          </div>
        )}
      </div>
    </section>
  )
}

export default DevotionDetail
