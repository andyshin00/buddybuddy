# Prototype reference (not part of the build)

These files were copied from the original Vite + localStorage prototype. Use them as **reference when porting features**; don't import them. `docs/` is excluded from TypeScript and ESLint.

| File | What to port | Where it should end up |
|---|---|---|
| `types.ts` | Data shapes | `src/server/db/schema.ts` (Drizzle tables + enums) |
| `rules.ts` | `getApplyBlocker`, `validateAnswers`, `missingRequiredLinks`, `hasSkill` | `src/features/*/rules.ts` + unit tests |
| `filters.ts` | Browse filter logic | A posts query that builds SQL from URL params |
| `templates.ts` | Application-form question templates | `src/features/posts/templates.ts` (almost as-is) |
| `constants.ts` | Post types, durations, timezones, skill/role suggestions | `src/lib/constants.ts` / Postgres enums |
| `seed.ts` | Demo users, posts, applications | `src/server/db/seed.ts` |

Things that **should not** be ported as-is:
- Answers stored only by question id. v2 stores a snapshot instead; see `docs/architecture.md`.
- Real full names shown publicly. See `docs/privacy.md`.
