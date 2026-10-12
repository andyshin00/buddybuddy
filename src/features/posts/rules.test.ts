import { describe, expect, it } from "vitest";

import { canManagePost } from "./rules";

describe("canManagePost", () => {
  it("lets the owner manage their post", () => {
    expect(canManagePost({ id: "u-maya" }, { ownerId: "u-maya" })).toBe(true);
  });

  it("does not let anyone else manage it", () => {
    expect(canManagePost({ id: "u-sam" }, { ownerId: "u-maya" })).toBe(false);
  });
});
