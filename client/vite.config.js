import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      output: {
        /**
         * Manual chunk splitting — keeps the initial bundle small and improves
         * long-term caching: each chunk only re-downloads when its own code changes.
         */
        manualChunks(id) {
          // React core + router — changes least often
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router-dom/') ||
              id.includes('node_modules/react-router/')) {
            return 'react-vendor';
          }

          // Framer Motion — large animation library, isolated chunk
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }

          // Markdown pipeline — react-markdown + remark plugins
          if (id.includes('node_modules/react-markdown') ||
              id.includes('node_modules/remark') ||
              id.includes('node_modules/rehype') ||
              id.includes('node_modules/unified') ||
              id.includes('node_modules/mdast') ||
              id.includes('node_modules/hast') ||
              id.includes('node_modules/micromark') ||
              id.includes('node_modules/vfile')) {
            return 'markdown';
          }

          // Icon libraries
          if (id.includes('node_modules/react-icons')) {
            return 'icons';
          }
        }
      }
    }
  }
})
