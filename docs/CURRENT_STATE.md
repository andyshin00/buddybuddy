# Current verified project state

**Last updated:** 2026-10-28
**Branch:** `main` (commits `bf05f34`, `f9a3113`). Sign-in, dashboard session check and `proxy.ts` are NOT committed yet.
**Status:** Auth basics done: sign-up, sign-in, sign-out, server-side session check and a route gate for `/dashboard`.

## Verified working
- Neon + Drizzle using the WebSocket driver (`db/index.ts`: `drizzle-orm/neon-serverless` + `Pool`). Migration `drizzle/0000_grey_blink.sql` applied; tables `user`, `session`, `account`, `verification` exist in Neon.
- Better Auth, built step by step in tutor mode:
  - `lib/auth.ts`: Drizzle adapter (`provider: "pg"`), email + password enabled.
  - `app/api/auth/[...all]/route.ts`: `/api/auth/ok` returns `{"ok":true}`.
  - `lib/auth-client.ts`: `createAuthClient()` with no `baseURL`.
  - `app/sign-up/page.tsx`: client form (controlled inputs) calling `authClient.signUp.email`.
  - `app/sign-in/page.tsx`: client form calling `authClient.signIn.email`; redirects to `/dashboard`.
  - `components/sign-out-button.tsx`: client component calling `authClient.signOut()` with error handling; redirects to `/sign-in`.
  - `app/dashboard/page.tsx`: server component; `auth.api.getSession({ headers: await headers() })` inside a `<Suspense>` boundary (required by `cacheComponents: true`); redirects to `/sign-in` with no session; shows the user email and `SignOutButton`.
  - `proxy.ts`: optimistic gate on `/dashboard/:path*` using `getSessionCookie` (cookie existence only); the page-level `getSession` is the real check.
- Manually verified in the browser: sign-up, sign-out and sign-in work; sign-out deletes the `session` row, sign-in creates a new one; signed-out `/dashboard` redirects to `/sign-in`.
- `tsc --noEmit`, `eslint .` and `next build` passed at the last run.

## Not done / known issues
- No automated tests yet (auth flows are verified manually only).
- Signed-in users can still visit `/sign-in` and `/sign-up`.
- No email verification (the product spec requires it later).
- shadcn style/theme was not chosen deliberately.

## Next task
BB-004, profiles with ownership rules (User A cannot edit B). Propose a task brief (see BACKLOG template) and pick tutor/pair/delegate before starting. Optional small follow-up: redirect signed-in users away from `/sign-in` and `/sign-up`.

Rule to keep repeating: the browser uses `authClient`; server code uses `auth.api`.

## Session handoff template (replace above with factual state)
- Date and Git branch/commit:
- Completed work (verified):
- Changed files:
- Commands/tests actually run and outcomes:
- Manual QA completed:
- Blockers, known bugs and uncommitted changes:
- Next single task ID:
- Concept learned / still confusing:
