import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  publicDir: path.resolve(__dirname, 'matri/public'),
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      '@matri': path.resolve(__dirname, 'matri/src'),
      '@admin': path.resolve(__dirname, 'admin/src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:5000',
      '/my_photos': 'http://localhost:5000',
      '/documents': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
      '/img': 'http://localhost:5000',
      '/horoscope-list': 'http://localhost:5000',
      '/SuccessStory': 'http://localhost:5000',
    },
  },
  preview: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
