import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      // Couverture limitée au code source (jamais le build compilé dist/)
      include: ["src/**/*.ts"],
      exclude: ["src/test/**", "**/*.d.ts", "src/index.ts"],
    },
  },
  resolve: {
    alias: {
      "@contentiq/shared": path.resolve(__dirname, "../packages/shared/src/index.ts"),
    },
  },
});
