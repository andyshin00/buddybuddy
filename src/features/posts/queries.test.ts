import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Viewer } from "@/server/auth";

// These tests check the authorization logic in getOwnPost without a real
// database. `vi.mock` swaps modules for fakes before queries.ts loads them.

// "server-only" throws outside Next.js server code; in tests it's a no-op.
vi.mock("server-only", () => ({}));

// A fake `db`: every query, however it's built (db.select().from()...),
// resolves to the next result in `results`, in order.
const results: unknown[][] = [];
vi.mock("@/server/db", () => {
  const chain: object = new Proxy(() => {}, {
    get: (_target, prop) =>
      prop === "then"
        ? (resolve: (rows: unknown[]) => void) => resolve(results.shift() ?? [])
        : () => chain,
  });
  return { db: chain };
});

const { getOwnPost } = await import("./queries");

const postId = "6f1c2c3e-1b2a-4c5d-8e9f-0a1b2c3d4e5f";
const mayasPost = {
  id: postId,
  ownerId: "u-maya",
  ownerUsername: "maya",
  title: "StudySync",
};

function viewer(id: string): Viewer {
  return { id, name: id, image: null, username: id };
}

beforeEach(() => {
  results.length = 0;
});

describe("getOwnPost", () => {
  it("returns the post to its owner", async () => {
    results.push([mayasPost], [], []); // post, its roles, its skills

    const found = await getOwnPost(viewer("u-maya"), postId);

    expect(found?.id).toBe(postId);
  });

  it("returns null (→ 404 page) for someone else's post", async () => {
    results.push([mayasPost], [], []);

    expect(await getOwnPost(viewer("u-sam"), postId)).toBeNull();
  });

  it("returns null for a post that doesn't exist", async () => {
    results.push([]);

    expect(await getOwnPost(viewer("u-maya"), postId)).toBeNull();
  });

  it("returns null for a malformed id without querying", async () => {
    expect(await getOwnPost(viewer("u-maya"), "not-a-uuid")).toBeNull();
  });
});
