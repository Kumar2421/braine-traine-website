import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Ensure proper chunking for better caching
        manualChunks: undefined,
      },
    },
    // Ensure proper MIME types in build
    assetsInlineLimit: 4096,
  },
  // Ensure proper base path for production
  base: '/',
})
