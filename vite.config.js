import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [svelte()], 
  server: {
    allowedHosts: ['lumi-insert.com'],
    port: 5173,
    proxy: { 
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
});
