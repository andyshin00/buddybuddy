# Decision log

Only record decisions the owner explicitly approves. Use dated entries for future changes, with alternatives and rationale. Treat technology proposals as **proposed** until implemented/approved.

## Accepted product decisions from planning discussion
- Hybrid response flow: poster selects **pre-existing** screening questions; applicant answers and sends intro (not a Google Forms clone).
- Poster reviews introductions and can pass/save/start chat.
- `Start Chat` gives two people access to a private conversation and is NOT group membership.
- Poster may chat with multiple interested people.
- `Invite as Buddy` followed by applicant acceptance creates confirmed membership.
- One buddy is a two-person group; group size 2–5 total including organizer.
- External Discord/Zoom supports study calls; BuddyBuddy does not need its own voice/video.
- Learn while building and permit selective delegation to Claude.

## Proposed technical decisions pending implementation confirmation
- Next.js/TypeScript, Neon/PostgreSQL, Drizzle, Better Auth, Zod, Tailwind/shadcn, Vercel, Resend, Vitest/Playwright.
- HTTP messaging + optional polling, not a custom WebSocket server.
- AI listing assistant and later semantic retrieval/matching with embeddings + pgvector and baseline evaluation.

## Open questions to resolve when relevant
- Initial launch niche: CS/developers only vs broader subjects.
- Exact question bank and structured availability format.
- Invite timeout and group capacity reservation policy.
- Whether MVP requires asynchronous messaging and email notification before small beta.
- Data retention, reports, and age policy.

## Decision template
### YYYY-MM-DD — Decision title
- Status: accepted / superseded / experimental
- Context:
- Options considered:
- Decision:
- Why:
- Impact on code/docs:
