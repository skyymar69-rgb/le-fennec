import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    chunkSizeWarningLimit: 800,
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react';
          if (id.includes('node_modules/recharts')) return 'recharts';
          if (id.includes('node_modules/lucide-react')) return 'icons';
          if (id.includes('node_modules/@tanstack')) return 'query';
        }
      }
    }
  },
})
