import { describe, expect, it } from "vitest";

import { type PrivateDetails, visiblePrivateDetails } from "./rules";

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
