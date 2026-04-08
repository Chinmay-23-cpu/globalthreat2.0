import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      '/valyu-api': {
        target: 'https://api.valyu.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/valyu-api/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: 'index.html',
      },
    },
  },
  css: {
    devSourcemap: true,
  },
  optimizeDeps: {
    include: ['maplibre-gl', 'date-fns'],
  },
});
