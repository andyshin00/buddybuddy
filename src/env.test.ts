import { afterEach, describe, expect, it, vi } from "vitest";

// env.ts validates process.env as soon as it's imported, so each test
// sets the variables first, then imports a fresh copy of the module.
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

// A complete, valid set. Each test changes one value.
const validEnv = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/buddybuddy",
  BETTER_AUTH_SECRET: "x".repeat(32),
  BETTER_AUTH_URL: "http://localhost:3000",
  GITHUB_CLIENT_ID: "github-id",
  GITHUB_CLIENT_SECRET: "github-secret",
  GOOGLE_CLIENT_ID: "google-id",
  GOOGLE_CLIENT_SECRET: "google-secret",
};

function stubEnv(overrides: Record<string, string | undefined> = {}) {
  for (const [key, value] of Object.entries({ ...validEnv, ...overrides })) {
    vi.stubEnv(key, value);
  }
}

describe("env", () => {
  it("accepts a complete set of variables", async () => {
    stubEnv();

    const { env } = await import("@/env");

    expect(env.DATABASE_URL).toBe(validEnv.DATABASE_URL);
  });

  it("throws when DATABASE_URL is missing", async () => {
    stubEnv({ DATABASE_URL: undefined });

    await expect(import("@/env")).rejects.toThrow(/DATABASE_URL/);
  });

  it("throws when DATABASE_URL is not a Postgres URL", async () => {
    stubEnv({ DATABASE_URL: "https://example.com" });

    await expect(import("@/env")).rejects.toThrow(/DATABASE_URL/);
  });

  it("throws when BETTER_AUTH_SECRET is too short", async () => {
    stubEnv({ BETTER_AUTH_SECRET: "short" });

    await expect(import("@/env")).rejects.toThrow(/BETTER_AUTH_SECRET/);
  });

  it("allows BETTER_AUTH_URL to be missing", async () => {
    stubEnv({ BETTER_AUTH_URL: undefined });

    const { env } = await import("@/env");

    expect(env.BETTER_AUTH_URL).toBeUndefined();
  });
});
