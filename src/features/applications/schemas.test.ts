import { describe, expect, it } from "vitest";
import { z } from "zod";

import { type ApplyQuestion, buildAnswersSchema } from "./schemas";

const questions: ApplyQuestion[] = [
  {
    id: "q1",
    type: "dropdown",
    label: "Level?",
    required: true,
    options: ["Low", "High"],
  },
  {
    id: "q2",
    type: "multi",
    label: "Tools?",
    required: false,
    options: ["Git", "Figma"],
  },
  {
    id: "q3",
    type: "yesno",
    label: "Deployed before?",
    required: true,
    options: [],
  },
  { id: "q4", type: "long", label: "Why?", required: true, options: [] },
  { id: "q5", type: "short", label: "Course?", required: false, options: [] },
];
const schema = buildAnswersSchema(questions);

const valid = {
  q1: "High",
  q2: ["Git"],
  q3: "No",
  q4: "Because it's fun.",
  q5: "",
};

function errorsFor(answers: object) {
  const result = schema.safeParse(answers);
  return result.success ? {} : z.flattenError(result.error).fieldErrors;
}

describe("buildAnswersSchema", () => {
  it("accepts a complete set of answers", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("lets optional questions be skipped", () => {
    expect(schema.safeParse({ ...valid, q2: [], q5: "" }).success).toBe(true);
  });

  it("requires the required ones", () => {
    expect(errorsFor({ ...valid, q1: "", q3: "", q4: "   " })).toEqual({
      q1: ["This question is required."],
      q3: ["This question is required."],
      q4: ["This question is required."],
    });
  });

  it("only accepts the poster's choices", () => {
    expect(errorsFor({ ...valid, q1: "Medium" })).toHaveProperty("q1");
    expect(errorsFor({ ...valid, q2: ["Photoshop"] })).toHaveProperty("q2");
    expect(errorsFor({ ...valid, q3: "Maybe" })).toHaveProperty("q3");
  });

  it("limits text length", () => {
    expect(errorsFor({ ...valid, q5: "x".repeat(201) })).toHaveProperty("q5");
  });

  it("works for a post with no questions", () => {
    expect(buildAnswersSchema([]).safeParse({}).success).toBe(true);
  });
});
