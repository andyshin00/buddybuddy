# Roadmap

Each checkbox is roughly **one small PR**. Tick it in the PR that completes it, and keep **Current status** up to date.

## Current status

- **Milestone:** M9 — Hardening
- **Done so far:**
  - Next.js scaffolded with `create-next-app`.
  - Project docs written.
  - GitHub repo created; `main` protected by the `protect-main` ruleset (PR required, squash only, no force push/deletion).
  - Prettier, `.editorconfig` and LF line endings (`.gitattributes`) set up.
  - `typecheck` script added. (A PR template was added, then removed as unneeded for a solo repo.)
  - CI (GitHub Actions) runs lint, format, typecheck and build on every PR; `ci` is a required check.
  - Vitest set up (`npm test`), and CI runs it.
  - Vercel connected: preview deploy per PR, production on merge to `main`.
  - Starter page replaced with a BuddyBuddy placeholder. **M0 complete.**
  - Neon project created (`main` = production, `dev` = local development); `.env.example` added.
  - `src/env.ts` validates environment variables with Zod (unit-tested).
  - Drizzle set up: `db` client in `src/server/db` (node-postgres pool, snake_case columns), `drizzle.config.ts`, `db:generate` / `db:migrate`.
  - First migration (`0000_profile_and_skills`): `profile`, `skill`, `profile_skill`, applied to the Neon `dev` branch. `profile.user_id` has no foreign key yet; it is added in M2.
  - Production deploys run `db:migrate` before building (`vercel.json`); see [ADR 002](decisions/002-migrations-on-deploy.md).
  - `npm run db:seed` fills the `dev` database with the prototype's 6 demo profiles and their skills. **M1 complete.**
  - Sign-in with GitHub and Google (Better Auth, account linking), sign-out, `getViewer()` / `requireViewer()` / `requireProfile()`, `proxy.ts`, and username onboarding, all in one PR. How it works and setup: [auth.md](auth.md). **M2 complete.**
  - Profiles: page `/u/[username]`, edit form `/settings/profile` (one Server Action, one transaction), private details in `profile_private` shown only through `getPrivateProfile()` (rules unit-tested). How it works: [profiles.md](profiles.md). **M3 complete.**
  - Posts: create / edit / close / reopen (owner-only, tested), post page, browse on `/` with URL filters turned into SQL, empty states, 8 demo posts. How it works: [posts.md](posts.md). **M4 complete.**
  - Application form builder: `post_question` table, question editor in the post form (add / remove / reorder, 5 types, required, choices), 4 templates. Explained in [posts.md](posts.md). **M5 complete.**
  - Applying: `application` table (answers saved with a copy of each question), `getApplyBlocker` + answer schema built from the questions (tested), apply page, "My applications" + withdraw, 10 demo applications. How it works: [applications.md](applications.md). **M6 complete.**
  - Reviewing: "My posts" with counts, owner-only applicants page (skill match, answers, tabs in the URL), accept / reject / back to pending in a transaction (optionally marking the role filled), contact details shown to both sides once accepted (`relationshipFrom`, tested), "projects posted / joined" on profiles. How it works: [reviewing.md](reviewing.md). **M7 complete.**
  - Notifications: `notification` table, created by `notify()` inside the apply / withdraw / status-change transactions (not a Server Action, on purpose), the header bell with an unread badge and dropdown, opening it marks all read, demo notifications in the seed. How it works: [notifications.md](notifications.md). **M8 complete.**
- **Next step:** M9 in one PR: Playwright E2E of the full flow in CI, `loading` / `error` / `not-found` pages, rate limiting on write actions, an accessibility pass, block / report and account deletion.

---

## M0 — Foundations (deployed "hello world", no features)

- [x] Scaffold Next.js (TS, Tailwind, ESLint, `src/`, App Router)
- [x] Project docs: `docs/`, README
- [x] Create GitHub repo `andyshin00/buddybuddy` (public) and push `main`
- [x] Branch protection on `main` (require PR, no force push; required checks get added with CI)
- [x] PR: Prettier + `format` / `format:check` scripts, `.editorconfig`
- [x] PR: `typecheck` script (PR template added, later removed)
- [x] PR: GitHub Actions CI: install → lint → typecheck → build; then mark it a required check in the ruleset
- [x] PR: Vitest set up + one trivial test; CI runs `test`
- [x] Connect Vercel: preview deploy per PR, production on `main`
- [x] Replace the starter page with a minimal BuddyBuddy placeholder (proves CD works)

## M1 — Database

- [x] Neon project with `main` (prod) and `dev` branches; `.env.example`
- [x] `src/env.ts`: Zod-validated environment variables
- [x] Drizzle setup (`src/server/db`), `drizzle.config.ts`, `db:generate` / `db:migrate` scripts
- [x] First migration: `profile`, `skill`, `profile_skill`
- [x] Run migrations on deploy (Vercel build step or CI job), documented in an ADR
- [x] Seed script porting the prototype's demo data (`docs/reference/prototype/seed.ts`)

## M2 — Auth

- [x] Better Auth + Drizzle adapter + auth tables migration (also adds the `profile.user_id` → `user.id` foreign key); `/api/auth/[...all]` handler
- [x] GitHub OAuth sign-in page, session in the root layout, sign-out
- [x] Google OAuth + account linking
- [x] `getViewer()` helper; route protection in `proxy.ts`
- [x] Onboarding: choose a unique username → creates `profile`; redirect until done

## M3 — Profiles

- [x] Public profile page `/u/[username]`
- [x] Edit own profile (Server Action + shared Zod schema; skills, experience, availability)
- [x] `profile_private` (real name, links, contact) + per-link public flags
- [x] `getPrivateProfile(viewer, userId)` authorization + unit tests

## M4 — Posts

- [x] Schema: `post`, `post_role`, `post_skill` + migration
- [x] Create post (without the form builder) + post detail page
- [x] Edit / close / reopen (owner-only, with a test proving non-owners get 404)
- [x] Browse page with post cards + empty states
- [x] Filters via URL params (search, type, skills, max hours, duration) → SQL

## M5 — Application form builder

- [x] Schema: `post_question` + migration
- [x] Question editor: add / remove / reorder, required, options; 5 question types
- [x] Question templates (port `docs/reference/prototype/templates.ts`)

## M6 — Applying

- [x] Schema: `application` (answers jsonb snapshot, unique(post, applicant)) + migration
- [x] `getApplyBlocker` and answer validation in `rules.ts` + unit tests (port the prototype's `rules.ts`)
- [x] Apply page: role picker, dynamic questions (Zod schema built from questions), optional message
- [x] "My applications" page + withdraw pending

## M7 — Reviewing

- [x] "My posts" page with applicant counts
- [x] Applicants page: skill match, availability, links, answers (owner-only)
- [x] Accept / reject / back to pending in a transaction; contact reveal on accept
- [x] Mark role filled; show collaborators on profiles ("projects joined")

## M8 — Notifications

- [x] Schema: `notification` + migration; created inside the M6/M7 actions (same transaction)
- [x] Navbar badge + dropdown, mark as read

## M9 — Hardening

- [ ] Playwright E2E of the full flow (post → apply → accept → contact revealed) in CI with a Postgres service container
- [ ] `loading.tsx` / `error.tsx` / `not-found.tsx` boundaries
- [ ] Rate limiting on write actions
- [ ] Accessibility pass (keyboard, labels, contrast)
- [ ] Block / report, account deletion

## M10 — Polish (owner's call)

- [ ] Landing page
- [ ] Animations (GSAP / Motion)
- [ ] Dark mode
