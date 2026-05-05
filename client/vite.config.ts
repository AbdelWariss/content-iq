import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contentiq/shared": path.resolve(__dirname, "../packages/shared/src/index.ts"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:5001",
        ws: true,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
          query: ["@tanstack/react-query"],
          ui: ["framer-motion", "lucide-react"],
          editor: ["@tiptap/react", "@tiptap/starter-kit"],
          charts: ["recharts"],
        },
      },
    },
  },
});
