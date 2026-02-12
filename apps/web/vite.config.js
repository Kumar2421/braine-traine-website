import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
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
  server: {
    port: 3000,
    strictPort: true,
  },
})
