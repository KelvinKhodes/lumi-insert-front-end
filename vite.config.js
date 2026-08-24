import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()], 
  server: {
    allowedHosts: ['lumi-insert.my.id'],
    port: 5173
  }
});
