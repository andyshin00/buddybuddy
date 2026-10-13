import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";

import { MAYA, query, signInAs } from "./support";

// Automated accessibility check: axe looks for missing labels, low
// contrast, broken ARIA and similar problems (WCAG 2.1 A and AA rules).
async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const summary = results.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target).join(", ")})`,
  );
  expect(summary).toEqual([]);
}

test.describe("signed out", () => {
  for (const path of ["/", "/sign-in"]) {
    test(`${path} is accessible`, async ({ page }) => {
      await page.goto(path);
      await expectNoA11yViolations(page);
    });
  }
});

test.describe("signed in", () => {
  test.beforeEach(async ({ context }) => {
    await signInAs(context, MAYA);
  });

  test("every main page is accessible", async ({ page }) => {
    const [post] = await query<{ id: string }>(
      `select id from post where owner_id = $1 limit 1`,
      [MAYA],
    );
    const paths = [
      "/",
      "/posts/new",
      `/posts/${post.id}`,
      `/posts/${post.id}/applicants`,
      "/my-posts",
      "/applications",
      "/u/sam",
      "/settings/profile",
      "/settings/account",
    ];
    for (const path of paths) {
      await test.step(path, async () => {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expectNoA11yViolations(page);
      });
    }
  });

  test("a missing page shows the 404 page", async ({ page }) => {
    await page.goto("/posts/00000000-0000-0000-0000-000000000000");
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
    await expectNoA11yViolations(page);
  });

  test("the skip link and the bell work from the keyboard", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();

    const bell = page.getByLabel(/^Notifications/);
    await bell.focus();
    await page.keyboard.press("Enter");
    const panel = page.getByText("Notifications", { exact: true });
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(bell).toBeFocused();
  });
});
