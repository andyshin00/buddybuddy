import { expect, test } from "@playwright/test";

import { query, signInAs } from "./support";

test("deleting your account removes you and signs you out", async ({
  browser,
}) => {
  // A throwaway user, made here so no demo user is lost.
  const id = `e2e-delete-${Date.now()}`;
  const username = `gone${Date.now() % 1_000_000}`;
  await query(`insert into "user" (id, name, email) values ($1, 'Temp', $2)`, [
    id,
    `${id}@example.com`,
  ]);
  await query(`insert into profile (user_id, username) values ($1, $2)`, [
    id,
    username,
  ]);
  const context = await browser.newContext();
  await signInAs(context, id);
  const page = await context.newPage();

  await page.goto("/settings/account");
  // The wrong word is refused.
  await page.getByLabel(/to confirm/).fill("nope");
  await page.getByRole("button", { name: "Delete my account" }).click();
  await expect(page.getByText(`Type ${username} to confirm.`)).toBeVisible();

  await page.getByLabel(/to confirm/).fill(username);
  await page.getByRole("button", { name: "Delete my account" }).click();
  await expect(page.getByText("Your account and everything")).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Sign in" }).first(),
  ).toBeVisible();

  const left = await query(`select 1 from "user" where id = $1`, [id]);
  expect(left).toHaveLength(0);
  await context.close();
});
