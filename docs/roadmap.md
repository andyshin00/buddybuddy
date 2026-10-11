# Roadmap

Each checkbox is roughly **one small PR**. Tick it in the PR that completes it, and keep **Current status** up to date.

## Current status

- **Milestone:** M1 — Database
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
- **Next step:** PR `chore: run migrations on deploy` (Vercel build step or CI job), with an ADR explaining the choice.

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
- [ ] Run migrations on deploy (Vercel build step or CI job), documented in an ADR
- [ ] Seed script porting the prototype's demo data (`docs/reference/prototype/seed.ts`)

## M2 — Auth

- [ ] Better Auth + Drizzle adapter + auth tables migration (also adds the `profile.user_id` → `user.id` foreign key); `/api/auth/[...all]` handler
- [ ] GitHub OAuth sign-in page, session in the root layout, sign-out
- [ ] Google OAuth + account linking
- [ ] `getViewer()` helper; route protection in `proxy.ts`
- [ ] Onboarding: choose a unique username → creates `profile`; redirect until done

## M3 — Profiles

- [ ] Public profile page `/u/[username]`
- [ ] Edit own profile (Server Action + shared Zod schema; skills, experience, availability)
- [ ] `profile_private` (real name, links, contact) + per-link public flags
- [ ] `getPrivateProfile(viewer, userId)` authorization + unit tests

## M4 — Posts

- [ ] Schema: `post`, `post_role`, `post_skill` + migration
- [ ] Create post (without the form builder) + post detail page
- [ ] Edit / close / reopen (owner-only, with a test proving non-owners get 404)
- [ ] Browse page with post cards + empty states
- [ ] Filters via URL params (search, type, skills, max hours, duration) → SQL

## M5 — Application form builder

- [ ] Schema: `post_question` + migration
- [ ] Question editor: add / remove / reorder, required, options; 5 question types
- [ ] Question templates (port `docs/reference/prototype/templates.ts`)

## M6 — Applying

- [ ] Schema: `application` (answers jsonb snapshot, unique(post, applicant)) + migration
- [ ] `getApplyBlocker` and answer validation in `rules.ts` + unit tests (port the prototype's `rules.ts`)
- [ ] Apply page: role picker, dynamic questions (Zod schema built from questions), optional message
- [ ] "My applications" page + withdraw pending

## M7 — Reviewing

- [ ] "My posts" page with applicant counts
- [ ] Applicants page: skill match, availability, links, answers (owner-only)
- [ ] Accept / reject / back to pending in a transaction; contact reveal on accept
- [ ] Mark role filled; show collaborators on profiles ("projects joined")

## M8 — Notifications

- [ ] Schema: `notification` + migration; created inside the M6/M7 actions (same transaction)
- [ ] Navbar badge + dropdown, mark as read

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
