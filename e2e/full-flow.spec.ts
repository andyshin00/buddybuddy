import { expect, test } from "@playwright/test";

import { MAYA, SAM, signInAs } from "./support";

// The main path through BuddyBuddy, as two people in two browsers:
// Maya posts a project → Sam applies → Maya accepts → Sam sees her contact.
test("post → apply → accept → contact revealed", async ({ browser }) => {
  const title = `E2E project ${Date.now()}`;
  const maya = await browser.newContext();
  const sam = await browser.newContext();
  await signInAs(maya, MAYA);
  await signInAs(sam, SAM);
  const mayaPage = await maya.newPage();
  const samPage = await sam.newPage();

  // 1. Maya creates a post.
  await mayaPage.goto("/posts/new");
  await mayaPage.getByLabel("Title").fill(title);
  await mayaPage
    .getByLabel("Description")
    .fill("A small app we build together, start to finish.");
  await mayaPage.getByLabel("Roles needed").fill("Frontend");
  await mayaPage.getByLabel("Hours per week").fill("5");
  await mayaPage.getByRole("button", { name: "Publish post" }).click();
  await expect(mayaPage.getByRole("heading", { name: title })).toBeVisible();
  const postUrl = mayaPage.url();

  // 2. Sam opens it and applies.
  await samPage.goto(postUrl);
  await samPage.getByRole("link", { name: "Apply" }).click();
  await samPage.getByLabel("Frontend").check();
  await samPage.getByRole("button", { name: "Send application" }).click();
  await expect(samPage).toHaveURL(/\/applications$/);
  const samRow = samPage.getByRole("listitem").filter({ hasText: title });
  await expect(samRow).toContainText("Pending");

  // 3. Maya's bell shows it, and she accepts Sam.
  await mayaPage.goto("/");
  await expect(
    mayaPage.getByLabel(/^Notifications, \d+ unread$/),
  ).toBeVisible();
  await mayaPage.goto(`${postUrl}/applicants`);
  // The first <li> with "@sam" is his card (it has smaller lists inside).
  const card = mayaPage
    .getByRole("listitem")
    .filter({ hasText: "@sam" })
    .first();
  await card.getByRole("button", { name: "Accept" }).click();
  await expect(card).toContainText("Accepted");

  // 4. Sam is accepted and can now see Maya's contact details.
  await samPage.goto("/applications");
  await expect(samRow).toContainText("Accepted");
  await expect(samRow).toContainText("maya.chen@example.edu");

  await maya.close();
  await sam.close();
});
