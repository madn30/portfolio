import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
          if (id.includes('/node_modules/three/')) return 'three'
          if (
            /\/node_modules\/(@react-three|react-reconciler|its-fine|zustand|suspend-react|react-use-measure)\//.test(
              id,
            )
          ) {
            return 'r3f'
          }
          if (id.includes('/node_modules/gsap/')) return 'gsap'
          return undefined
        },
      },
    },
  },
})
