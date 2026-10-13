import { describe, expect, it } from "vitest";

import {
  type ApplicationLink,
  type PrivateDetails,
  relationshipFrom,
  visiblePrivateDetails,
} from "./rules";

// Maya's private details: GitHub is public, LinkedIn and portfolio are not.
const maya: PrivateDetails = {
  realName: "Maya Chen",
  githubUrl: "https://github.com/mayachen",
  linkedinUrl: "https://linkedin.com/in/mayachen",
  portfolioUrl: "https://maya.dev",
  githubPublic: true,
  linkedinPublic: false,
  portfolioPublic: false,
  email: "maya@example.com",
  discord: "mayac",
};

const everything = {
  realName: "Maya Chen",
  links: {
    github: "https://github.com/mayachen",
    linkedin: "https://linkedin.com/in/mayachen",
    portfolio: "https://maya.dev",
  },
  email: "maya@example.com",
  discord: "mayac",
};

describe("visiblePrivateDetails", () => {
  it("shows everything to the owner", () => {
    expect(visiblePrivateDetails("self", maya)).toEqual(everything);
  });

  it("shows everything to a collaborator", () => {
    expect(visiblePrivateDetails("collaborator", maya)).toEqual(everything);
  });

  it("shows a reviewer all links, but no real name or contact", () => {
    expect(visiblePrivateDetails("reviewer", maya)).toEqual({
      links: everything.links,
    });
  });

  it("shows a stranger only the links marked public", () => {
    expect(visiblePrivateDetails("stranger", maya)).toEqual({
      links: { github: "https://github.com/mayachen" },
    });
  });

  it("leaves out empty fields, even for the owner", () => {
    const empty: PrivateDetails = {
      ...maya,
      realName: null,
      githubUrl: null,
      email: null,
    };
    const visible = visiblePrivateDetails("self", empty);

    expect(visible).not.toHaveProperty("realName");
    expect(visible).not.toHaveProperty("email");
    expect(visible.links).not.toHaveProperty("github");
  });

  it("never includes the hidden fields' keys for a stranger", () => {
    const visible = visiblePrivateDetails("stranger", maya);

    expect(Object.keys(visible)).toEqual(["links"]);
  });
});

describe("relationshipFrom", () => {
  // Maya posted a project; Sam applied to it.
  const samToMaya = (status: ApplicationLink["status"]): ApplicationLink => ({
    applicantId: "u-sam",
    ownerId: "u-maya",
    status,
  });

  it("is self for your own profile", () => {
    expect(relationshipFrom("u-maya", "u-maya", [])).toBe("self");
  });

  it("is stranger with no applications between them", () => {
    expect(relationshipFrom("u-maya", "u-sam", [])).toBe("stranger");
  });

  it("makes the poster a reviewer of a pending or rejected applicant", () => {
    expect(relationshipFrom("u-maya", "u-sam", [samToMaya("pending")])).toBe(
      "reviewer",
    );
    expect(relationshipFrom("u-maya", "u-sam", [samToMaya("rejected")])).toBe(
      "reviewer",
    );
  });

  it("does not let the applicant review the poster", () => {
    expect(relationshipFrom("u-sam", "u-maya", [samToMaya("pending")])).toBe(
      "stranger",
    );
  });

  it("makes both sides collaborators once accepted", () => {
    expect(relationshipFrom("u-maya", "u-sam", [samToMaya("accepted")])).toBe(
      "collaborator",
    );
    expect(relationshipFrom("u-sam", "u-maya", [samToMaya("accepted")])).toBe(
      "collaborator",
    );
  });

  it("ignores applications between other people", () => {
    const other = {
      applicantId: "u-leo",
      ownerId: "u-maya",
      status: "accepted",
    } as const;
    expect(relationshipFrom("u-sam", "u-maya", [other])).toBe("stranger");
  });
});
