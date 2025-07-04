/// <reference types="vitest" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      'Cross-Origin-Embedder-Policy': 'cross-origin',
      'Cross-Origin-Opener-Policy': 'same-origin',
    }
  },
  plugins: [
    react(),
    // command === 'serve' && componentTagger(), // Temporariamente desabilitado devido a erro de sintaxe
    command === 'build' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-select', '@radix-ui/react-dialog', 'framer-motion'],
          'query-vendor': ['@tanstack/react-query'],
        }
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    css: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query', 'framer-motion']
  }
}));
