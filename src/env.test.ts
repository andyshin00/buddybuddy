import { afterEach, describe, expect, it, vi } from "vitest";

// env.ts validates process.env as soon as it's imported, so each test
// sets the variables first, then imports a fresh copy of the module.
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("env", () => {
  it("accepts a Postgres connection string", async () => {
    const url = "postgresql://user:pass@localhost:5432/buddybuddy";
    vi.stubEnv("DATABASE_URL", url);

    const { env } = await import("@/env");

    expect(env.DATABASE_URL).toBe(url);
  });

  it("throws when DATABASE_URL is missing", async () => {
    vi.stubEnv("DATABASE_URL", undefined);

    await expect(import("@/env")).rejects.toThrow(/DATABASE_URL/);
  });

  it("throws when DATABASE_URL is not a Postgres URL", async () => {
    vi.stubEnv("DATABASE_URL", "https://example.com");

    await expect(import("@/env")).rejects.toThrow(/DATABASE_URL/);
  });
});
