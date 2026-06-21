import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: "./" → relative asset URLs so the build works when hosted under any subpath
export default defineConfig({
  plugins: [react()],
  base: './',
})
