import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

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
        manualChunks(id) {
          if (
            id.includes("react-dom") ||
            id.includes("react-router-dom") ||
            id.includes("node_modules/react/")
          )
            return "vendor";
          if (id.includes("@reduxjs/toolkit") || id.includes("react-redux")) return "redux";
          if (id.includes("@tanstack/react-query")) return "query";
          if (id.includes("framer-motion") || id.includes("lucide-react")) return "ui";
          if (id.includes("@tiptap")) return "editor";
          if (id.includes("recharts")) return "charts";
        },
      },
    },
  },
});
