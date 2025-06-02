import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '140.238.250.199',
      'lms.saisamarth.duckdns.org',
      'saisamarth.duckdns.org'
    ],
    watch: {
      usePolling: true
    },
    hmr: {
      host: '140.238.250.199',
      port: 5173
    }
  }
})
