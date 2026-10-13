import { expect, test } from "@playwright/test";

import { JORDAN, MAYA, query, SAM, signInAs } from "./support";

test("blocking hides each other's posts and profiles", async ({ browser }) => {
  const jordan = await browser.newContext();
  const maya = await browser.newContext();
  await signInAs(jordan, JORDAN);
  await signInAs(maya, MAYA);
  const jordanPage = await jordan.newPage();
  const mayaPage = await maya.newPage();

  const [mayaPost] = await query<{ title: string }>(
    `select title from post where owner_id = $1 and status = 'open' limit 1`,
    [MAYA],
  );
  await jordanPage.goto("/");
  await expect(jordanPage.getByText(mayaPost.title)).toBeVisible();

  // Jordan blocks Maya from her profile.
  await jordanPage.goto("/u/maya");
  await jordanPage.getByRole("button", { name: "Block @maya" }).click();
  await expect(jordanPage.getByText("You blocked @maya")).toBeVisible();

  // Jordan no longer sees Maya's posts in browse…
  await jordanPage.goto("/");
  await expect(jordanPage.getByText(mayaPost.title)).toHaveCount(0);
  // …and to Maya, Jordan's profile looks like it doesn't exist.
  await mayaPage.goto("/u/jordan");
  await expect(
    mayaPage.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();

  // Unblocking brings everything back.
  await jordanPage.goto("/u/maya");
  await jordanPage.getByRole("button", { name: "Unblock" }).click();
  await expect(
    jordanPage.getByRole("button", { name: "Block @maya" }),
  ).toBeVisible();
  await jordanPage.goto("/");
  await expect(jordanPage.getByText(mayaPost.title)).toBeVisible();

  await jordan.close();
  await maya.close();
});

test("reporting a post saves a report", async ({ browser }) => {
  const sam = await browser.newContext();
  await signInAs(sam, SAM);
  const page = await sam.newPage();
  const [mayaPost] = await query<{ id: string }>(
    `select id from post where owner_id = $1 limit 1`,
    [MAYA],
  );

  await page.goto(`/posts/${mayaPost.id}`);
  await page.getByText("Report this post").click();
  await page.getByLabel("Reason").selectOption("spam");
  await page.getByLabel("Details").fill("E2E test report");
  await page.getByRole("button", { name: "Send report" }).click();
  await expect(page.getByText("Thanks for the report")).toBeVisible();

  const reports = await query(
    `select 1 from report
     where reporter_id = $1 and post_id = $2 and target_user_id = $3`,
    [SAM, mayaPost.id, MAYA],
  );
  expect(reports).toHaveLength(1);
  await sam.close();
});

test("rate limiting stops too many reports, then lets up", async ({
  browser,
}) => {
  const sam = await browser.newContext();
  await signInAs(sam, SAM);
  const page = await sam.newPage();
  const [mayaPost] = await query<{ id: string }>(
    `select id from post where owner_id = $1 limit 1`,
    [MAYA],
  );
  async function report() {
    await page.goto(`/posts/${mayaPost.id}`);
    await page.getByText("Report this post").click();
    await page.getByLabel("Reason").selectOption("other");
    await page.getByRole("button", { name: "Send report" }).click();
  }

  // Pretend Sam already sent 10 reports this hour (the limit).
  await query(
    `insert into rate_limit (key, window_start, count) values ($1, now(), 10)
     on conflict (key) do update set window_start = now(), count = 10`,
    [`report:${SAM}`],
  );
  await report();
  await expect(page.getByText("You’re doing that too often")).toBeVisible();

  // An hour later the window is over, and reporting works again.
  await query(
    `update rate_limit set window_start = now() - interval '61 minutes'
     where key = $1`,
    [`report:${SAM}`],
  );
  await report();
  await expect(page.getByText("Thanks for the report")).toBeVisible();
  await sam.close();
});
