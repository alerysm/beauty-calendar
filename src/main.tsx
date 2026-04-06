import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Register service worker (vite-plugin-pwa handles this in prod)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW registration is optional for dev
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
