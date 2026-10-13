# Hardening (M9)

M9 added no big new feature. It makes the app safer, sturdier and easier to use: tests that click through it in a real browser, proper error pages, limits on how fast people can do things, accessibility fixes, and tools to block, report and leave.

## 1. Browser tests (Playwright)

**E2E (end-to-end) test:** a robot opens a real browser, clicks through the real app, and checks what appears on screen. Unit tests (Vitest) check one function; E2E tests check that all the pieces work together.

| File                    | What it checks                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| `e2e/full-flow.spec.ts` | Maya posts → Sam applies → Maya's bell shows it → she accepts → Sam sees her contact details  |
| `e2e/safety.spec.ts`    | Blocking hides posts and profiles (and unblocking brings them back); reports; the rate limit  |
| `e2e/account.spec.ts`   | Deleting an account: the wrong word is refused, the right one deletes you and signs you out   |
| `e2e/pages.spec.ts`     | Every main page passes the axe accessibility check; the 404 page; the skip link and bell keys |

**How the tests sign in without GitHub.** `signInAs()` in `e2e/support.ts` does what Better Auth does after a real sign-in: it saves a session row and sets the signed cookie. Signing the cookie needs `BETTER_AUTH_SECRET`, so only someone who already has the server's secret can do this.

**Run them on your computer:**

```bash
npx playwright install chromium   # once: downloads the test browser
npm run build                     # the tests run against the production build
npm run test:e2e                  # re-seeds the demo data first, then runs e2e/
```

They use the database in `DATABASE_URL` (your Neon `dev` branch). Before the tests run, `npm run db:seed` resets the demo users. Your own account isn't touched.

**On GitHub:** CI has a second job, `e2e`. It starts a throwaway Postgres database (a "service container") that exists only while the job runs, applies the migrations, builds, and runs the tests. If a test fails, the job's page has a `playwright-report` download with screenshots and a step-by-step trace.

## 2. Error, not-found and loading pages

| File                       | When it shows                                                                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/not-found.tsx`    | Any URL that doesn't exist, and every `notFound()`: a missing post, someone else's applicants page, a profile that blocked you. They all look the same on purpose |
| `src/app/error.tsx`        | Something on a page throws (a database hiccup, a bug, a rate-limited button). The header stays, and "Try again" calls `retry()`                                   |
| `src/app/global-error.tsx` | The root layout itself breaks. It replaces the whole page, so it has its own `<html>`                                                                             |
| `src/app/loading.tsx`      | While a page's first content loads, for pages without their own loading text                                                                                      |

**"The server could not finish this Suspense boundary… Switched to client rendering."** In dev, you may see this in the browser console when a page redirects you, or shows "not found", while it's already loading. For example, an account with no username yet is sent to `/onboarding` from every page. This is expected. The page starts streaming before it knows where you belong, so the server tells the browser to go there instead, and React notes the switch. The Next.js guides use the same pattern (`streaming.md`, "Status codes"; `authentication-with-cache-components.md`). Nothing is broken, and production doesn't log it.

## 3. Rate limiting

**Rate limit:** a cap on how often one person can do something, such as 20 applications an hour. It stops scripts from flooding the site with posts, applications or reports.

The limits are in `src/server/rate-limit.ts`:

| Action                                                        | Limit         |
| ------------------------------------------------------------- | ------------- |
| New post                                                      | 10 per hour   |
| Apply                                                         | 20 per hour   |
| Report                                                        | 10 per hour   |
| Everything else (edits, accept/reject, block, withdraw, etc.) | 60 per minute |

**How it counts ("fixed window").** Each user and action has one row in `rate_limit`, e.g. `apply:u-sam`. The first try starts a window with count 1, and each try inside the window adds 1. Once the window is over, the next try starts a fresh one. Updating the counter and reading it back is **one SQL statement** (`INSERT … ON CONFLICT DO UPDATE … RETURNING`), so two requests at the same moment can't both slip through.

**Why Postgres and not memory?** On Vercel, many copies of the app run at once, and each has its own memory. A counter in memory would only count the requests that reached that one copy.

**What the user sees.** A form (post, apply, profile, report) shows "You're doing that too often…" at the top and keeps what they typed. A plain button (Accept, Block, Close post…) shows the error page.

## 4. Accessibility

- **Skip link.** The first Tab on any page shows "Skip to content", which jumps past the header.
- **Focus rings.** Anything you reach with Tab gets a visible outline (`:focus-visible` in `globals.css`). Mouse clicks don't show it.
- **The bell** works from the keyboard: Enter opens it, and Escape closes it and puts focus back on the bell.
- **Landmarks.** The header links are a `<nav>`, and each page has one `<main>` and one `<h1>`, so screen-reader users can jump around.
- **Reduced motion.** People who turn on "reduce motion" in their OS don't get the pulsing loading placeholders.
- **axe** checks every main page in the E2E tests for WCAG 2.1 A/AA problems: missing labels, low contrast, broken ARIA. A new violation fails CI.

## 5. Block, report, delete your account

**Block** (on someone's profile). It works both ways:

- Neither of you sees the other's posts in browse (`notBlockedWith()` in `searchPosts`).
- Neither of you can apply to the other's projects (`getApplyBlocker`).
- To the person you blocked, your profile and posts look like they don't exist (`getProfileByUsername` and `getPost` return null).
- You still see their profile, with an **Unblock** button.
- Applications sent before the block stay, so you can still reject them.

**Report** (a user, on their profile; a post, on the post page). A short form with a reason and optional details. It's saved in `report`. **There's no admin page yet:** read reports in the Neon console (SQL Editor) with `select * from report order by created_at desc`.

**Delete account** (`/settings/account`, linked from "Edit profile" and from onboarding). You type your username to confirm. Then:

1. You're signed out.
2. The `user` row is deleted, and **`ON DELETE CASCADE`** deletes everything that points to it: sessions, sign-in accounts, profile, private details, skills, posts (with their roles, questions and applications), your applications, notifications, blocks and reports.
3. Your rate-limit counters are deleted by hand, because they aren't linked to the user by a foreign key.

**Limit:** reports about a deleted user are deleted with them. If keeping them matters later, the foreign key can be changed to `set null`.

## Code map

| File                                       | What it does                                                         |
| ------------------------------------------ | -------------------------------------------------------------------- |
| `src/server/db/migrations/0007_safety.sql` | The `block`, `report` and `rate_limit` tables                        |
| `src/server/rate-limit.ts`                 | `isRateLimited()` (for forms) and `enforceRateLimit()` (for buttons) |
| `src/features/safety/rules.ts`             | Pure: who blocked whom (tested)                                      |
| `src/features/safety/queries.ts`           | `getBlockState()`, `notBlockedWith()`                                |
| `src/features/safety/actions.ts`           | `blockUser`, `unblockUser`, `submitReport`                           |
| `src/features/account/`                    | `deleteAccount` and the confirmation rule (tested)                   |
| `playwright.config.ts`, `e2e/`             | The browser tests                                                    |
