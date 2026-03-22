import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // C'est parfait, l'app se met à jour toute seule
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-able-icon.svg'],
      manifest: {
        name: 'CID Medical by Belle Imagerie', // On ajoute la signature ici aussi
        short_name: 'CID Medical',
        description: 'Optimisation du flux médical et suppression des retards d\'interprétation',
        theme_color: '#020617', // CHANGÉ : On utilise le noir profond de ta nouvelle Landing
        background_color: '#020617', // CHANGÉ : Pour éviter le flash blanc au démarrage
        display: 'standalone',
        orientation: 'portrait', // Optionnel : force l'app en mode portrait sur mobile
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