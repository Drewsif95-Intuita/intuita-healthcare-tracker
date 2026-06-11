import { useEffect } from 'react'
import NhsTargetingPrototype from './components/NhsTargetingPrototype.jsx'

function App() {
  useEffect(() => {
    document.title = 'Intuita Healthcare Tracker'
  }, [])

  return <NhsTargetingPrototype />
}

export default App
