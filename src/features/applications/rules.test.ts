import { describe, expect, it } from "vitest";

import { type ApplyPost, getApplyBlocker, missingRequiredLinks } from "./rules";

const post: ApplyPost = {
  ownerId: "u-maya",
  status: "open",
  roles: [
    { id: "r1", filled: false },
    { id: "r2", filled: true },
  ],
  requiredLinks: [],
};
const sam = { id: "u-sam", links: {}, alreadyApplied: false };

describe("getApplyBlocker", () => {
  it("lets someone apply to an open post with an open role", () => {
    expect(getApplyBlocker(post, sam)).toBeNull();
  });

  it("blocks the owner", () => {
    expect(getApplyBlocker(post, { ...sam, id: "u-maya" })?.reason).toBe(
      "This is your post.",
    );
  });

  it("blocks applying when either person blocked the other", () => {
    expect(getApplyBlocker(post, { ...sam, blocked: true })?.reason).toBe(
      "You can’t apply to this post.",
    );
  });

  it("blocks a second application", () => {
    expect(
      getApplyBlocker(post, { ...sam, alreadyApplied: true })?.reason,
    ).toMatch(/already applied/);
  });

  it("blocks a closed post", () => {
    expect(getApplyBlocker({ ...post, status: "closed" }, sam)?.reason).toMatch(
      /closed/,
    );
  });

  it("blocks when every role is filled", () => {
    const full = { ...post, roles: [{ id: "r1", filled: true }] };

    expect(getApplyBlocker(full, sam)?.reason).toMatch(/filled/);
  });

  it("names the missing required links", () => {
    const strict: ApplyPost = {
      ...post,
      requiredLinks: ["github", "linkedin"],
    };

    expect(getApplyBlocker(strict, sam)).toEqual({
      reason: "This post requires GitHub and LinkedIn on your profile.",
      missingLinks: ["github", "linkedin"],
    });
  });

  it("checks the owner rule before anything else", () => {
    const closed = { ...post, status: "closed" as const };

    expect(getApplyBlocker(closed, { ...sam, id: "u-maya" })?.reason).toBe(
      "This is your post.",
    );
  });
});

describe("missingRequiredLinks", () => {
  it("counts a link as present even if it's private, but not if it's blank", () => {
    expect(
      missingRequiredLinks(["github", "portfolio"], {
        github: "https://github.com/sam",
        portfolio: "  ",
      }),
    ).toEqual(["portfolio"]);
  });
});
