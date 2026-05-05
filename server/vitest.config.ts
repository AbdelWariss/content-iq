import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["src/test/**", "**/*.d.ts"],
    },
  },
  resolve: {
    alias: {
      "@contentiq/shared": path.resolve(__dirname, "../packages/shared/src/index.ts"),
    },
  },
});
