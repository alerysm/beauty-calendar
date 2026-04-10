import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

if ('serviceWorker' in navigator) {
  let refreshing = false

  // Reload the page as soon as a new SW takes control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true
      window.location.reload()
    }
  })

  window.addEventListener('load', () => {
    navigator.serviceWorker
      // updateViaCache: 'none' → browser always fetches sw.js from the network,
      // bypassing the HTTP cache, so new deployments are detected immediately.
      .register('/sw.js', { updateViaCache: 'none' })
      .then(registration => {
        // Proactively check for a new SW version on every page load
        registration.update()

        // Also check whenever the user switches back to this tab
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            registration.update()
          }
        })
      })
      .catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
