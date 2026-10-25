import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'

// App decides which page to show for each URL.
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App
