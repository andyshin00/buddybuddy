import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig({
  resolve: {
    // Lets tests use the "@/..." alias from tsconfig.json (Vite 8 built-in).
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    // Vite only exposes VITE_* vars by default; the "" prefix loads all of them.
    // Mode "test" loads .env first, then .env.test overrides it.
    env: loadEnv("test", process.cwd(), ""),
    setupFiles: ["./tests/setup.ts"],
  },
});
