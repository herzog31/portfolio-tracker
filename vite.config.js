import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  // Set base path for GitHub Pages deployment
  // In production, the site will be served from /portfolio-tracker/
  // In development, it will be served from root /
  base: process.env.NODE_ENV === 'production' ? '/portfolio-tracker/' : '/',
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
})
