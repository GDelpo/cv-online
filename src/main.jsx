import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '@fontsource/barlow-condensed/latin-600.css'
import '@fontsource/barlow-condensed/latin-800.css'
import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
import './index.css'
import App from '@/App'
import { localeFromPath } from '@/lib/locale'

async function start() {
  const locale = localeFromPath(location.pathname)
  // INTENTIONAL: two literal imports, not a template string, so each locale stays its own chunk.
  const { default: content } = await (locale === 'en' ? import('@/content/en.json') : import('@/content/es.json'))
  const root = document.getElementById('root')
  const app = (
    <StrictMode>
      <App content={content} />
    </StrictMode>
  )
  // Dev serves the template with only the <!--app--> comment, which is not a child element.
  if (root.children.length > 0) {
    hydrateRoot(root, app)
  } else {
    document.documentElement.lang = locale
    createRoot(root).render(app)
  }
}

// INTENTIONAL: a failed chunk load leaves the prerendered page readable; only the theme toggle stops working.
start().catch((error) => console.error('cv-online: could not start the app', error))
