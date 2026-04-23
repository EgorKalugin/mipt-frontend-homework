import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy GigaChat OAuth endpoint (ngw.devices.sberbank.ru:9443/api/v2/oauth)
      '/gigachat-auth': {
        target: 'https://ngw.devices.sberbank.ru:9443',
        changeOrigin: true,
        rewrite: () => '/api/v2/oauth',
        secure: false, // GigaChat uses a non-standard Russian CA certificate
      },
      // Proxy GigaChat chat completions endpoint
      '/gigachat-api': {
        target: 'https://gigachat.devices.sberbank.ru',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gigachat-api/, '/api/v1'),
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-markdown') || id.includes('react-syntax-highlighter')) {
            return 'markdown';
          }
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/')
          ) {
            return 'react-vendor';
          }
        },
      },
    },
  },
})
