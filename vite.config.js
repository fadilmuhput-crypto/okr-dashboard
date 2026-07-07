import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: "./" → relative asset URLs so the build works when hosted under any subpath
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      // /api/* is served by the Worker (worker/index.js) — run
      // `npx wrangler dev` on 8787 alongside `npm run dev` to exercise it locally.
      '/api': { target: 'http://localhost:8787', changeOrigin: true },
    },
  },
})
