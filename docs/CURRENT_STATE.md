# Current verified project state

**Last updated:** 2026-10-28
**Branch:** `main` (commits `bf05f34`, `f9a3113`). The sign-in page and the sign-out redirect fix are NOT committed yet.
**Status:** Sign-up, sign-out and sign-in work. Server-side session reading and route protection are not built yet.

## Verified working
- Neon + Drizzle using the WebSocket driver (`db/index.ts`: `drizzle-orm/neon-serverless` + `Pool`). Migration `drizzle/0000_grey_blink.sql` applied; tables `user`, `session`, `account`, `verification` exist in Neon.
- Better Auth, built step by step in tutor mode:
  - `lib/auth.ts`: Drizzle adapter (`provider: "pg"`), email + password enabled.
  - `app/api/auth/[...all]/route.ts`: `/api/auth/ok` returns `{"ok":true}`.
  - `lib/auth-client.ts`: `createAuthClient()` with no `baseURL`.
  - `app/sign-up/page.tsx`: client form (controlled inputs) calling `authClient.signUp.email`.
  - `app/sign-in/page.tsx`: client form calling `authClient.signIn.email`; redirects to `/dashboard`.
  - `components/sign-out-button.tsx`: client component calling `authClient.signOut()` with error handling; redirects to `/sign-in`.
  - `app/dashboard/page.tsx`: placeholder server component rendering `SignOutButton`.
- Manually verified in the browser: sign-up, sign-out and sign-in work; sign-out deletes the `session` row, sign-in creates a new one.
- `tsc --noEmit` and `eslint .` passed at the last run.

## Not done / known issues
- `/dashboard` is not protected: it renders for signed-out users. No server-side session reading. No `proxy.ts` (Next 16 renamed `middleware` to `proxy`).
- Signed-in users can still visit `/sign-in` and `/sign-up`.
- No email verification (the product spec requires it later).
- shadcn style/theme was not chosen deliberately.

## Next task
BB-003, Better Auth tutorial **step 8: server session + protect `/dashboard`** (tutor mode).

## For next session
Read `CLAUDE.md`, this file, and `docs/BACKLOG.md`. Mode is **tutor**: the developer writes the code; give doc links and small steps, then review.
- **8. Server session**: `auth.api.getSession({ headers: await headers() })` in the server `app/dashboard/page.tsx`, then protect `/dashboard` with `proxy.ts`. Read `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` (Next 16) before writing proxy code.

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
