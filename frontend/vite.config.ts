import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backendUrl = process.env.VITE_API_BASE_URL || process.env.VITE_DEV_API_BASE_URL || 'http://127.0.0.1:5004'

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: [
        '**/.venv/**',
        '**/__pycache__/**',
        '**/detect/**',
        '**/train/**',
        '**/valid/**',
        '**/test/**',
      ],
    },
    proxy: {
      '/api': {
        target: backendUrl,
        changeOrigin: true,
      },
    },
  },
})
