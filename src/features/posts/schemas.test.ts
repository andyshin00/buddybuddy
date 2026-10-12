import { describe, expect, it } from "vitest";

import {
  emptyPost,
  parseBrowseFilters,
  postFormSchema,
  questionsSchema,
} from "./schemas";
import { QUESTION_TEMPLATES } from "./templates";

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

describe("questionsSchema", () => {
  const parse = (questions: unknown) =>
    questionsSchema.safeParse(JSON.stringify(questions));
  const messages = (questions: unknown) => {
    const result = parse(questions);
    return result.success ? [] : result.error.issues.map((i) => i.message);
  };

  it("accepts an empty list", () => {
    expect(parse([]).success).toBe(true);
  });

  it("drops blank choices, and choices on types that don't use them", () => {
    const result = parse([
      {
        type: "dropdown",
        label: "Level?",
        required: true,
        options: ["A", "", "B"],
      },
      { type: "short", label: "Name?", required: false, options: ["stray"] },
    ]);

    expect(result.data?.[0].options).toEqual(["A", "B"]);
    expect(result.data?.[1].options).toEqual([]);
  });

  it("needs a question label, naming the question number", () => {
    expect(
      messages([
        { type: "short", label: "Fine", required: false, options: [] },
        { type: "short", label: "  ", required: false, options: [] },
      ]),
    ).toEqual(["Question 2: write the question."]);
  });

  it("needs at least 2 different choices for dropdown and checkboxes", () => {
    expect(
      messages([
        {
          type: "multi",
          label: "Pick",
          required: false,
          options: ["Only one"],
        },
      ]),
    ).toEqual(["Question 1: add at least 2 choices."]);
    expect(
      messages([
        {
          type: "dropdown",
          label: "Pick",
          required: false,
          options: ["Yes", "yes"],
        },
      ]),
    ).toEqual(["Question 1: each choice must be different."]);
  });

  it("allows at most 10 questions", () => {
    const one = { type: "yesno", label: "Ok?", required: false, options: [] };

    expect(parse(Array(11).fill(one)).success).toBe(false);
  });

  it("rejects text that isn't a question list", () => {
    expect(questionsSchema.safeParse("not json").success).toBe(false);
    expect(
      parse([{ type: "essay", label: "Hi", required: false, options: [] }])
        .success,
    ).toBe(false);
  });
});

describe("QUESTION_TEMPLATES", () => {
  it.each(QUESTION_TEMPLATES.map((t) => [t.name, t]))(
    "%s passes the same rules as a poster's own questions",
    (_name, template) => {
      expect(parse(template.questions).success).toBe(true);
    },
  );

  function parse(questions: unknown) {
    return questionsSchema.safeParse(JSON.stringify(questions));
  }
});
