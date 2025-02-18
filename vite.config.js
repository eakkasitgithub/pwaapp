import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
    }),
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'leaflet': path.resolve(__dirname, 'node_modules/leaflet') // Ensure Vite resolves Leaflet correctly
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'] // Auto-resolving file extensions
  },
  optimizeDeps: {
    include: ['leaflet'], // Force Vite to optimize Leaflet dependency
  }
});
