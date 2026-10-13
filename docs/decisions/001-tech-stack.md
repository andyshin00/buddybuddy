# 001 — Tech stack

- **Status:** Accepted
- **Date:** 2026-10-10

> **What's an ADR?** An Architecture Decision Record is a short note explaining _why_ a decision was made. Months later, nobody remembers the reasons; this file does. Each one has the same parts: context, decision and consequences. Write a new one for each big decision; don't edit old ones, supersede them.

## Context

- A prototype (Vite + React + localStorage, fake users) proved the workflow. The real app needs persistent data, real accounts, server-side authorization, and a deploy pipeline.
- The developer already knows Next.js route handlers, Drizzle + Neon, Zod and Tailwind from a previous project. That project hand-rolled JWT auth and fetched data in client components.
- The goal is a codebase that follows professional practice without being overwhelming to learn.

## Decision

| Area          | Choice                                                           | Main reason                                                                                                                       |
| ------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Framework     | **Next.js 16 App Router**                                        | Already familiar. Server Components and Server Actions remove most API-route boilerplate                                          |
| Database      | **Neon Postgres + Drizzle**, generated migrations                | Already familiar. Relational data (posts ↔ roles ↔ applications) fits SQL. Migrations give a reviewable history of schema changes |
| Auth          | **Better Auth** with GitHub + Google OAuth                       | No password storage, reset flows or hashing to get wrong. Type-safe and works with Drizzle. GitHub sign-in fits the audience      |
| Authorization | Our own server-side data layer (not database row-level security) | Easier to read, debug and test as plain TypeScript                                                                                |
| UI            | **Tailwind v4 + shadcn/ui** for accessible primitives            | Dropdowns, dialogs and selects are hard to make accessible by hand. We own the generated code                                     |
| Testing       | **Vitest** (unit) and **Playwright** (E2E, added in M9)          | Fast unit tests for business rules first; one E2E flow once features exist                                                        |
| CI/CD         | **GitHub Actions + Vercel**                                      | Every PR is linted, type-checked, tested, built and previewed before merge                                                        |

## Consequences

- **Good:**
  - Less custom security code.
  - One language and framework end to end.
  - Every change is reviewed and checked automatically.
- **Costs:**
  - New concepts to learn: Server Actions, caching/revalidation, Better Auth's schema, migrations workflow.
  - We need OAuth apps configured on GitHub and Google, for both dev and prod callback URLs.
- **Revisit if:**
  - We need a mobile app or a public API (add route handlers or a separate API layer then).
  - Authorization rules get complex enough that database row-level security would be safer.
