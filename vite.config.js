import { defineConfig } from 'vite';

export default defineConfig({
  root: 'frontend',  // Directorio donde está tu aplicación frontend (ajusta esto según tu estructura)
  build: {
    outDir: '../dist', // Directorio donde se guardará la build (ajusta esto según tu estructura)
  },
});