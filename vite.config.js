import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return;
          }

          if (
            id.includes('/node_modules/clsx/') ||
            id.includes('/node_modules/tailwind-merge/') ||
            id.includes('/node_modules/class-variance-authority/')
          ) {
            return 'ui-utils';
          }

          if (id.includes('/node_modules/framer-motion/')) {
            return 'motion';
          }

          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/react-router-dom/')) {
            return 'react';
          }

          if (id.includes('/node_modules/@radix-ui/')) {
            return 'radix';
          }
        },
      },
    },
  },
  server: {
    allowedHosts: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
}) 
