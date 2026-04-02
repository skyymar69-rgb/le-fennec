import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    target: 'es2020',
    cssMinify: true,
  },
})
// cache-bust Thu Apr  2 01:59:38 UTC 2026
