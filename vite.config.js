import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@ui': fileURLToPath(new URL('./src/components/common/ui', import.meta.url)),
      '@layout': fileURLToPath(new URL('./src/components/common/layout', import.meta.url)),
      '@cv': fileURLToPath(new URL('./src/components/cv', import.meta.url)),
      '@sections': fileURLToPath(new URL('./src/components/cv/sections', import.meta.url)),
    }
  }
})
