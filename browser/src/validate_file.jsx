import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/styles.css'

function ContrastApp() {
  return (
    <div>
      <h2>Validate file</h2>
      <p>Coming soon...</p>
    </div>
  )
}

const root = document.getElementById('root')
createRoot(root).render(<ContrastApp />)
