# Roadmap — 0 to MVP (planned)

**Completion rule:** A milestone is complete only after actual code works, access-control tests pass, and the developer can explain the flow. This document is a plan, not current progress.

## Phase 0 — Foundation

- New Next.js TypeScript repository, lint/typecheck scripts, Git, Vercel preview, development Neon DB, Drizzle with versioned migrations.
- Finish criteria: deployed skeleton, repeatable setup; no secrets in Git.

## Phase 1 — Auth and profiles

- Established authentication with verified email and secure sessions; signup/login/logout/recovery; basic profile.
- Finish: two users cannot read/edit each other's profile settings.

## Phase 2 — Listing CRUD

- Create/edit/close/reopen, browse, listing detail, filters, pagination, responsive UI.
- Finish: end-to-end listing flow and negative ownership tests.

## Phase 3 — Screening question bank

- Store predefined templates; poster chooses up to 3; immutable question snapshots for submissions.
- Finish: render correct questions on a listing.

## Phase 4 — Introductions

- Private applications with answers, no duplicates, applicant tracking.
- Finish: applicant submits once, owner sees it, unrelated users cannot.

## Phase 5 — Interested People inbox

- Review answers, pass/save/start chat; factual compatibility labels only.
- Finish: authorized owner controls states.

## Phase 6 — 1:1 messaging (HTTP + polling)

- Conversation tied to accepted introduction, messages persisted, access control, pagination, blocking and error handling.
- Finish: two browsers can chat; third account cannot access conversation.

## Phase 7 — Invitations and groups

- Invite, accept/decline/expire, spot reservation, leave; 2–5 members, group detail and external contact handoff.
- Finish: never overbook under simultaneous acceptances.

## Phase 8 — Production safety

- Email notifications, rate limiting, abuse reporting/moderation, privacy/terms, accessibility/mobile review, CI and automated end-to-end tests.
- Finish: private beta ready.

## Phase 9 — Private beta

- Small niche cohort, feedback, instrument conversion/response/study-start rates, fix reliability issues.

## AI feature roadmap

- After listing CRUD: optional listing writing assistant to learn API calls, Zod structured output, costs, privacy.
- After baseline search: semantic embeddings + pgvector, hybrid ranking, labeled evaluation set, Precision@5 vs keyword baseline; defer production until verified useful.
- Avoid agent/tool-calling workflow until standard search is proven inadequate.
