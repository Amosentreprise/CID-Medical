import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register' // Import magique de Vite-PWA
import './index.css'
import App from './App.jsx'

// Enregistre le Service Worker pour la PWA
// 'immediate: true' force l'activation dès que possible
registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)