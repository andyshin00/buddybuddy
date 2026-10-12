import { describe, expect, it } from "vitest";

import { emptyPost, parseBrowseFilters, postFormSchema } from "./schemas";

const valid = {
  ...emptyPost,
  title: "StudySync",
  description: "Shared study rooms for CS courses, with a timer.",
  roles: "Backend, Designer",
  requiredSkills: "Node.js",
  niceSkills: "Figma",
  hoursPerWeek: "6",
};

describe("postFormSchema", () => {
  it("accepts a valid post and splits the lists", () => {
    const post = postFormSchema.parse(valid);

    expect(post.roles).toEqual(["Backend", "Designer"]);
    expect(post.hoursPerWeek).toBe(6);
    expect(post.timezone).toBeNull();
  });

  it("needs at least one role", () => {
    const result = postFormSchema.safeParse({ ...valid, roles: " , " });

    expect(result.success).toBe(false);
  });

  it("rejects a skill that is both required and nice-to-have", () => {
    const result = postFormSchema.safeParse({
      ...valid,
      requiredSkills: "React",
      niceSkills: "react",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an unknown required link", () => {
    const result = postFormSchema.safeParse({
      ...valid,
      requiredLinks: ["myspace"],
    });

    expect(result.success).toBe(false);
  });
});

describe("parseBrowseFilters", () => {
  it("reads filters from the URL", () => {
    const filters = parseBrowseFilters({
      search: "game",
      type: "ideate",
      skills: "React, python",
      maxHours: "10",
      duration: "weekend",
    });

    expect(filters).toEqual({
      search: "game",
      type: "ideate",
      skills: ["React", "python"],
      maxHours: 10,
      duration: "weekend",
    });
  });

  it("ignores invalid values instead of failing", () => {
    const filters = parseBrowseFilters({
      type: "nonsense",
      maxHours: "lots",
      duration: "forever",
    });

    expect(filters).toEqual({ search: "", skills: [] });
  });

  it("uses the first value when a parameter repeats", () => {
    expect(parseBrowseFilters({ search: ["a", "b"] }).search).toBe("a");
  });
});
