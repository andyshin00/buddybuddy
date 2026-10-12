import { describe, expect, it } from "vitest";

import { timeAgo } from "./time-ago";

const now = new Date("2026-10-11T12:00:00Z");
const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000);

describe("timeAgo", () => {
  it.each([
    [10, "just now"],
    [60, "1 minute ago"],
    [3 * 3600, "3 hours ago"],
    [24 * 3600, "1 day ago"],
    [40 * 24 * 3600, "1 month ago"],
  ])("%i seconds → %s", (seconds, expected) => {
    expect(timeAgo(ago(seconds), now)).toBe(expected);
  });
});
