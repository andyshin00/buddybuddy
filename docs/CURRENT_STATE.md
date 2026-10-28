# Current verified project state

**Last updated:** 2026-10-28
**Branch:** `main` (one commit, `bf05f34`). All work since is staged but NOT committed.
**Status:** Database and sign-up work. Sign-out, sign-in and route protection are not built yet.

## Verified working
- Neon + Drizzle using the WebSocket driver (`db/index.ts`: `drizzle-orm/neon-serverless` + `Pool`). Migration `drizzle/0000_grey_blink.sql` applied; tables `user`, `session`, `account`, `verification` exist in Neon.
- Better Auth, built step by step in tutor mode:
  - `lib/auth.ts`: Drizzle adapter (`provider: "pg"`), email + password enabled.
  - `app/api/auth/[...all]/route.ts`: `/api/auth/ok` returns `{"ok":true}`.
  - `lib/auth-client.ts`: `createAuthClient()` with no `baseURL`.
  - `app/sign-up/page.tsx`: client form calling `authClient.signUp.email`.
- Sign-up creates a `user` row, a `credential` `account` row (hashed password), a `session` row and the `better-auth.session_token` cookie. The server rejects duplicate emails and passwords under 8 characters.
- `tsc --noEmit` and `eslint` passed at the last run.

## Not done / known issues
- `app/dashboard/` does not exist, but sign-up redirects to `/dashboard` (404 until it is recreated).
- No sign-out, sign-in, server-side session reading, or route protection. No `proxy.ts` (Next 16 renamed `middleware` to `proxy`).
- No email verification (the product spec requires it later).
- shadcn style/theme was not chosen deliberately.

## Next task
BB-003, Better Auth tutorial **step 6: sign out** (tutor mode).

## For next session
Read `CLAUDE.md`, this file, and `docs/BACKLOG.md`. Mode is **tutor**: the developer writes the code; give doc links and small steps, then review. Remaining steps:
- **6. Sign out**: a button calling `authClient.signOut()`; the `session` row should disappear.
- **7. Sign in**: `authClient.signIn.email`; a new `session` row should appear.
- **8. Server session**: `auth.api.getSession({ headers })` in a server page, then protect `/dashboard` with `proxy.ts`. Read `node_modules/next/dist/docs/` (Next 16) before writing proxy code.

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
