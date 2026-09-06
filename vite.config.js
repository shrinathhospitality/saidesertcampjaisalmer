import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The PHP API runs as its own process in development (see README-CMS.md:
// `php -S localhost:8090 -t public`). Vite proxies /api and /uploads to it
// so the frontend can always call same-origin relative paths in both dev
// and production, with no hardcoded localhost URLs in app code.
const apiProxyTarget = process.env.VITE_API_PROXY_TARGET || 'http://localhost:8090';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true,
    proxy: {
      '/api': { target: apiProxyTarget, changeOrigin: true },
      '/uploads': { target: apiProxyTarget, changeOrigin: true }
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion', 'gsap'],
          galleries: ['swiper', 'lightgallery']
        }
      }
    }
  }
});
