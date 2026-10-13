import { describe, expect, it } from "vitest";

import { confirmationWord, isConfirmed } from "./rules";

describe("confirmationWord", () => {
  it("is the username", () => {
    expect(confirmationWord({ username: "maya" })).toBe("maya");
  });

  it("is 'delete' before onboarding", () => {
    expect(confirmationWord({ username: null })).toBe("delete");
  });
});

describe("isConfirmed", () => {
  it("accepts the username, ignoring capitals and spaces", () => {
    expect(isConfirmed(" Maya ", { username: "maya" })).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isConfirmed("", { username: "maya" })).toBe(false);
    expect(isConfirmed("may", { username: "maya" })).toBe(false);
    expect(isConfirmed("delete", { username: "maya" })).toBe(false);
  });

  it("accepts 'delete' when there's no username", () => {
    expect(isConfirmed("DELETE", { username: null })).toBe(true);
  });
});
