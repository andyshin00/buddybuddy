import { describe, expect, it } from "vitest";

import {
  badgeLabel,
  newApplicationNotice,
  statusChangeNotice,
  withdrawnNotice,
} from "./rules";

const about = { postId: "p1", postTitle: "StudySync", roleName: "Backend" };

describe("notices", () => {
  it("tells the poster who applied, and links to pending applicants", () => {
    expect(
      newApplicationNotice({ ...about, applicantUsername: "sam" }),
    ).toEqual({
      kind: "new_application",
      text: "@sam applied for Backend on “StudySync”",
      link: "/posts/p1/applicants?status=pending",
    });
  });

  it("tells the applicant the outcome, kindly", () => {
    expect(statusChangeNotice({ ...about, status: "accepted" }).text).toBe(
      "Your application for Backend on “StudySync” was accepted 🎉",
    );
    expect(statusChangeNotice({ ...about, status: "rejected" }).text).toMatch(
      /was not selected$/,
    );
    expect(statusChangeNotice({ ...about, status: "pending" }).link).toBe(
      "/applications",
    );
  });

  it("tells the poster about a withdrawal", () => {
    expect(withdrawnNotice({ ...about, applicantUsername: "sam" })).toEqual({
      kind: "withdrawn",
      text: "@sam withdrew their application for Backend on “StudySync”",
      link: "/posts/p1/applicants",
    });
  });
});

describe("badgeLabel", () => {
  it("shows nothing at zero, the number up to 9, then 9+", () => {
    expect(badgeLabel(0)).toBeNull();
    expect(badgeLabel(3)).toBe("3");
    expect(badgeLabel(12)).toBe("9+");
  });
});
