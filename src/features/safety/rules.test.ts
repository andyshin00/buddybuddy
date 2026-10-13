import { describe, expect, it } from "vitest";

import { blockStateFrom, isBlockedEitherWay } from "./rules";

describe("blockStateFrom", () => {
  it("is all false with no blocks", () => {
    expect(blockStateFrom("maya", "sam", [])).toEqual({
      iBlocked: false,
      blockedMe: false,
    });
  });

  it("sees a block by the viewer", () => {
    const state = blockStateFrom("maya", "sam", [
      { blockerId: "maya", blockedId: "sam" },
    ]);
    expect(state).toEqual({ iBlocked: true, blockedMe: false });
  });

  it("sees a block of the viewer", () => {
    const state = blockStateFrom("maya", "sam", [
      { blockerId: "sam", blockedId: "maya" },
    ]);
    expect(state).toEqual({ iBlocked: false, blockedMe: true });
  });

  it("ignores blocks involving other people", () => {
    const state = blockStateFrom("maya", "sam", [
      { blockerId: "maya", blockedId: "jordan" },
      { blockerId: "jordan", blockedId: "maya" },
    ]);
    expect(isBlockedEitherWay(state)).toBe(false);
  });
});

describe("isBlockedEitherWay", () => {
  it("is true if either side blocked", () => {
    expect(isBlockedEitherWay({ iBlocked: true, blockedMe: false })).toBe(true);
    expect(isBlockedEitherWay({ iBlocked: false, blockedMe: true })).toBe(true);
    expect(isBlockedEitherWay({ iBlocked: false, blockedMe: false })).toBe(
      false,
    );
  });
});
