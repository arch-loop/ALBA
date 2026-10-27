import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' permite publicar la carpeta dist en cualquier hosting estático (GitHub Pages, Netlify, etc.)
export default defineConfig({
  plugins: [react()],
  base: './',
});
