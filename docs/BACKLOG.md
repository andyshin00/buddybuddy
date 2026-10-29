# Prioritized backlog

Statuses: `TODO`, `IN PROGRESS`, `BLOCKED`, `DONE` (only with verification). An item can be divided into smaller slices; don't implement multiple items by default.

| ID | Status | Task | Learning focus | Definition of done |
|---|---|---|---|---|
| BB-001 | IN PROGRESS | Scaffold Next.js/TS repo; Git; checks (works; only the commit is pending) | CLI/project setup | Starts, builds, lint works, committed |
| BB-002 | DONE | Setup dev Postgres + Drizzle migrations | SQL/schema/migrations | Migration and sample query verified |
| BB-003 | IN PROGRESS | Choose and integrate auth (Better Auth). Done: config, tables, route, client, sign-up, sign-out, sign-in. Left: server session + protect /dashboard | Sessions/auth | Sign up/in/out and tests |
| BB-004 | TODO | Profiles with ownership rules | AuthZ | User A cannot edit B |
| BB-005 | TODO | Listing schema and CRUD | Relations/queries | Owner controls own listing |
| BB-006 | TODO | Browse/filter/pagination | URL params/server queries | Functional on desktop/mobile |
| BB-007 | TODO | Question bank and listing selection | Relation modeling | Up to three templates saved |
| BB-008 | TODO | Introduction submission/answers | Validation/transactions | No duplicates/private leakage |
| BB-009 | TODO | Owner review inbox | Permissions/state machine | Pass/save/start chat work |
| BB-010 | TODO | Private conversations/messages | HTTP/authZ/polling | 2 accounts chat; third denied |
| BB-011 | TODO | Invitations and membership | Transactions/concurrency | No capacity overbooking |
| BB-012 | TODO | Safety, email, moderation | Operations/privacy | Review/test checklist passes |
| BB-013 | TODO | Private beta and measurement | Product analytics | Real test users complete flow |
| BB-A01 | TODO | Optional AI listing-writing assistant | LLM structured output | User reviews output; no invented data |
| BB-A02 | TODO | Search baseline + semantic ranking | Embeddings/pgvector/evals | Baseline comparison documented |

## Single-task brief template
- Task ID:
- Problem / user outcome:
- In scope:
- Out of scope:
- Files likely affected:
- Delegation: tutor / pair / delegate
- Acceptance criteria (observable):
- Automated and manual verification:
- Security / edge cases:
- Documentation to update:
