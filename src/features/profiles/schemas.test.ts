import { describe, expect, it } from "vitest";

import { profileFormSchema, usernameSchema } from "./schemas";

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

describe("profileFormSchema", () => {
  // What the form sends when every box is empty.
  const blank = {
    displayName: "",
    headline: "",
    bio: "",
    experience: "",
    hoursPerWeek: "",
    timezone: "",
    skills: "",
    realName: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    githubPublic: false,
    linkedinPublic: false,
    portfolioPublic: false,
    email: "",
    discord: "",
  };

  it("turns empty boxes into null", () => {
    const data = profileFormSchema.parse(blank);

    expect(data.bio).toBeNull();
    expect(data.hoursPerWeek).toBeNull();
    expect(data.githubUrl).toBeNull();
    expect(data.skills).toEqual([]);
  });

  it("splits skills on commas, trims and removes duplicates", () => {
    const data = profileFormSchema.parse({
      ...blank,
      skills: " React, TypeScript,, react ",
    });

    expect(data.skills).toEqual(["React", "TypeScript"]);
  });

  it("turns hours into a number", () => {
    expect(
      profileFormSchema.parse({ ...blank, hoursPerWeek: "8" }).hoursPerWeek,
    ).toBe(8);
  });

  it.each(["0", "200", "2.5", "lots"])("rejects %j hours", (hours) => {
    expect(
      profileFormSchema.safeParse({ ...blank, hoursPerWeek: hours }).success,
    ).toBe(false);
  });

  it("only accepts https links", () => {
    const http = profileFormSchema.safeParse({
      ...blank,
      githubUrl: "http://github.com/maya",
    });
    const https = profileFormSchema.safeParse({
      ...blank,
      githubUrl: "https://github.com/maya",
    });

    expect(http.success).toBe(false);
    expect(https.success).toBe(true);
  });

  it("rejects a timezone that isn't in the list", () => {
    expect(
      profileFormSchema.safeParse({ ...blank, timezone: "Mars" }).success,
    ).toBe(false);
  });
});
