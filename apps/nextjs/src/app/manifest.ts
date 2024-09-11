import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aila: Oak's AI Lesson Assistant",
    short_name: 'Aila',
    description: 'An AI lesson assistant chatbot for UK teachers to create lessons personalised for their classes, with the aim of reducing teacher workload.',
    start_url: '/',
    display: 'minimal-ui',
    background_color: '#BEF2BD',
    theme_color: '#BEF2BD',
    icons: [
      {
        "src": "/favicon/android-chrome-192x192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/favicon/android-chrome-512x512.png",
        "sizes": "512x512",
        "type": "image/png"
      },
      {
        "src": "/favicon/apple-touch-icon.png",
        "sizes": "180x180",
        "type": "image/png"
      },
      {
        "src": "/favicon/favicon-16x16.png",
        "sizes": "16x16",
        "type": "image/png"
      },
      {
        "src": "/favicon/favicon-32x32.png",
        "sizes": "32x32",
        "type": "image/png"
      },
      {
        "src": "/favicon/favicon.ico",
        "sizes": "48x48 16x16 32x32",
        "type": "image/x-icon"
      }
    ]
  }
}