import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Same "@/..." import alias as tsconfig.json
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // Unit tests for pure functions (rules.ts) run in Node, no browser needed
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
