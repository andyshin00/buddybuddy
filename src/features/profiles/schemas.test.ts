import { describe, expect, it } from "vitest";

import { usernameSchema } from "./schemas";

describe("usernameSchema", () => {
  it("accepts letters, numbers and underscores", () => {
    expect(usernameSchema.parse("maya_99")).toBe("maya_99");
  });

  it("trims spaces and lowercases", () => {
    expect(usernameSchema.parse("  Maya ")).toBe("maya");
  });

  it.each(["ab", "a".repeat(21), "has space", "dash-name", "émile", ""])(
    "rejects %j",
    (name) => {
      expect(usernameSchema.safeParse(name).success).toBe(false);
    },
  );

  it("rejects reserved names", () => {
    expect(usernameSchema.safeParse("Admin").success).toBe(false);
  });
});
