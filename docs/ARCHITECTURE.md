# Architecture — Proposed, not yet implemented

## One-repository architecture
Browser: React and Next.js client components for interactive forms/inbox/chat.
Server: Next.js App Router server components, Server Actions and Route Handlers for data operations.
Database: Neon-hosted PostgreSQL + Drizzle ORM.
Auth: prefer established provider/library such as Better Auth, not hand-rolled JWT; select exact adapter/setup after reviewing current docs.
Validation: Zod server-side.
Email: transactional provider such as Resend (after feature works).
Hosting: Vercel candidate.
Testing: Vitest for logic/integration; Playwright for browser workflows.
Realtime: none required initially; fetch messages on open and poll while active. Add provider later only if usage warrants.

## Data entities (conceptual; not migration-ready)
- Auth-managed `user`, `session`, `account`, verification-related entities.
- `profile(user_id, display_name, bio, avatar, ...)`.
- `listing(id, owner_id, title, topic, body, timezone, availability, weekly_commitment, max_members, status, ...)`.
- `question_template(id, version, prompt, type, options)`.
- `listing_question(id, listing_id, template_id, position, snapshot)`.
- `introduction(id, listing_id, applicant_id, message, status, timestamps)`, unique active introduction per (listing, applicant).
- `introduction_answer(id, introduction_id, listing_question_id, answer)`.
- `conversation(id, listing_id, introduction_id)` and `conversation_participant(conversation_id, user_id)`.
- `message(id, conversation_id, sender_id, body, created_at)` with pagination and indexed ordering.
- `group_invitation(id, listing_id, inviter_id, invitee_id, status, expires_at)`.
- `membership(id, listing_id, user_id, role, status)`.
- `block(blocker_id, blocked_id)`, `report(id, reporter_id, target_type, target_id, reason, status)`.
- Optional `notification(id, recipient_id, event_type, read_at, ...)` and email outbox later.

## Critical invariants
1. Enforce auth and authorization on the server for every private read/write.
2. Only owner manages their listing and sees introductions and screening answers.
3. Applicant cannot introduce themselves to own listing; prevent duplicates with database constraints.
4. Conversation starts only via owner-approved `Start Chat`; participants alone can read/write its messages; blocks prevent future contact.
5. `Start Chat` does **not** occupy a study-group spot.
6. Invitation is accepted only by target user, before expiry, and when capacity is available; outstanding invitations reserve spots. Use a concurrency-safe transaction/locking/conditional update appropriate to the driver.
7. Group maximum 5 including owner; owner automatically belongs to group.
8. Do not send passwords, sessions, or private message content to LLM providers by default.
9. External links and private contact data must only be shared intentionally with authorized participants.

## AI additions (post-core workflow)
- Listing assistant: server-only LLM call, Zod structured output, user edits/approves, limits and audit/error handling.
- Semantic matching: embeddings generated only for public listing-derived text; pgvector storage; SQL availability/capacity filters; hybrid ranking with explicit relevance evals. Cache/recompute on relevant edits.
- Not in MVP: autonomous tools that send invitations/messages, private conversation embeddings, complex agent orchestration.

## Suggested directory boundaries once code exists
`app/` for pages and endpoints; `components/` reusable UI; `db/schema/` and `db/migrations/`; `features/listings`, `features/introductions`, `features/conversations`, `features/memberships` for server-side domain logic; `lib/` integrations; `tests/` automated verification.

## Important open architecture decisions
- Final auth library and deployment setup.
- Availability schema (simple text vs structured days/time intervals).
- Whether emails are required before messaging launch.
- Durable email delivery/retry strategy.
- Data retention, deletion, and handling members leaving/being removed.
- How exactly to implement reservation-safe capacity with the selected Neon driver. Do not invent guarantees.
