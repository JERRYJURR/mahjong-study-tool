import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1',
    proxy: {
      '/api/anthropic': {
        target: 'https://api.anthropic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/anthropic/, ''),
      },
      // Proxy to local Express server for analyze/jobs/players/explain
      '/api/analyze': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/api/jobs': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/api/players': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/api/explain': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
      '/api/health': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
})
