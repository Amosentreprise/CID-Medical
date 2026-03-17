import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-able-icon.svg'],
      manifest: {
        name: 'CID Medical - Calendrier',
        short_name: 'CID',
        description: 'Gestion intelligente des disponibilités médicales',
        theme_color: '#0f172a', // La couleur de la barre d'état sur mobile
        background_color: '#0f172a',
        display: 'standalone', // Pour que l'app s'ouvre sans la barre d'adresse du navigateur
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})