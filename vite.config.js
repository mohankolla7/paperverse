import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three-bundle';
          }
          if (id.includes('node_modules/pdfjs-dist')) {
            return 'pdfjs-bundle';
          }
        }
      }
    }
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  }
});
