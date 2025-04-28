import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // alias `@/` para importar desde src
      "/src": path.resolve(__dirname, "./src"), // soporte para `/src/` absoluto
    },
  },
  server: {
    host: true,
  },
});

