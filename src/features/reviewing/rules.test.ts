import { describe, expect, it } from "vitest";

import { countByStatus, skillMatch, statusChoices } from "./rules";

describe("skillMatch", () => {
  const post = {
    requiredSkills: ["React", "TypeScript"],
    niceSkills: ["Figma"],
  };

  it("marks which skills the applicant has, ignoring capitals", () => {
    expect(skillMatch(["react", "Figma"], post)).toEqual({
      required: [
        { name: "React", has: true },
        { name: "TypeScript", has: false },
      ],
      nice: [{ name: "Figma", has: true }],
    });
  });

  it("works when the applicant lists no skills", () => {
    expect(skillMatch([], post).required.every((s) => !s.has)).toBe(true);
  });
});

describe("countByStatus", () => {
  it("counts each status and the total", () => {
    expect(
      countByStatus([
        { status: "pending" },
        { status: "pending" },
        { status: "accepted" },
      ]),
    ).toEqual({ all: 3, pending: 2, accepted: 1, rejected: 0 });
  });
});

describe("statusChoices", () => {
  it("offers accept and reject for a pending application", () => {
    expect(statusChoices("pending")).toEqual(["accepted", "rejected"]);
  });

  it("offers a way back to pending once decided", () => {
    expect(statusChoices("accepted")).toEqual(["rejected", "pending"]);
    expect(statusChoices("rejected")).toEqual(["accepted", "pending"]);
  });
});
