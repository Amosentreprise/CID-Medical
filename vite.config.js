import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // L'app se met à jour toute seule dès qu'un changement est détecté
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-able-icon.svg'],
      manifest: {
        name: 'BI-AGENDA by Belle Imagerie', // Nouveau nom complet
        short_name: 'BI-AGENDA', // Nom qui s'affiche sous l'icône du téléphone
        description: 'Gestion des disponibilités et notifications pour l\'interprétation médicale',
        theme_color: '#020617', 
        background_color: '#020617', 
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})