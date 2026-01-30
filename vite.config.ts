import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Inventori',
        short_name: 'Inventori',
        description: 'A local-first home inventory app',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'https://placehold.co/192x192/3b82f6/ffffff?text=Inv',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'https://placehold.co/512x512/3b82f6/ffffff?text=Inv',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'https://placehold.co/512x512/3b82f6/ffffff?text=Inv',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
})
