// app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Todo App',
    short_name: 'Todo',
    description: 'Organize tasks and stay on schedule',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a', // Matches your dark theme background
    theme_color: '#0f172a',
    icons: [
      {
        src: '/icon-192x192.png', // You'll need to drop some icon images in your public folder!
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}