import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

/**
 * INTENTIONAL: Vercel serves /en from en/index.html, but vite preview falls back to the Spanish page, which then fails
 * hydration. This keeps local QA and scripts/pdf.mjs looking at what production serves. Preview only: no effect on dist.
 */
const previewCleanEnglishUrl = {
  name: 'preview-clean-english-url',
  configurePreviewServer(server) {
    server.middlewares.use((req, _res, next) => {
      req.url = req.url.replace(/^\/en(?=[?#]|$)/, '/en/index.html')
      next()
    })
  },
}

export default defineConfig({
  plugins: [react(), previewCleanEnglishUrl],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
