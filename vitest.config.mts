import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Lets tests use the "@/..." alias from tsconfig.json (Vite 8 built-in).
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
  },
});
