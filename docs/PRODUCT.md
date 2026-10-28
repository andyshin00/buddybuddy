# BuddyBuddy — Product specification (draft v0.1)

## Vision
A web platform helping students and developers find compatible 1:1 study partners or small study groups, using structured introductions instead of low-information comments and without pretending to replace Discord/Zoom.

## Target users
Initial focus **proposed, not finalized**: CS students and early-career developers seeking LeetCode, programming, accountability, and project partners. Long-term possibility: all academic subjects. Validate niche with users before expanding.

## Core product journey
1. Visitor browses public listings; can create an account.
2. Authenticated user creates a listing with topic, goal, availability, timezone, study style, experience, and desired group size.
3. Poster chooses up to **3 pre-existing screening questions** from a bank; no custom form builder in MVP.
4. Applicant answers questions and sends a short personal introduction.
5. Poster gets a private Interested People inbox; may save, pass, or choose **Start Chat**.
6. Start Chat authorizes a private 1:1 conversation between poster and that applicant, tied to the listing/intro. Poster may chat with multiple candidates.
7. Poster can **Invite as Buddy** from a conversation. An invitation reserves one of the remaining slots. Applicant may accept or decline.
8. On acceptance, create group membership. Listing becomes full when confirmed members + reserved invited places reach configured capacity. Members can access a minimalist group page and coordinate via private chat/Discord/Zoom.
9. Users can withdraw applications, close/reopen listings, leave groups, and block/report abuse.

## Definitions
- **Introduction**: expression of interest + selected screening answers; not an acceptance or friendship.
- **Conversation**: private permission to exchange messages; not proof of group membership.
- **Group invitation**: limited-lifetime offer to occupy a spot; accept/decline.
- **Membership**: confirmed user joined a group associated with a listing.
- **Listing owner**: counts as one member.
- **Group size**: 2–5 **total** members including owner; a 1-buddy listing means total size 2.

## Listing fields (proposed)
Required: title, topic/subject, short description, learning goal, timezone (IANA identifier), availability, expected weekly commitment, max total participants (2..5). Optional: experience level, study method (accountability, co-work, peer practice, project collaboration), notes, tags, online/in-person. Do not require exact age/school or publicly display private contact details.

## Screening question bank (examples)
Experience level (select), weekly commitment (select), availability (text or structured day/time), primary goals (short text), preferred study style (select). Answers are private to applicant and listing owner. Question definitions/versions should be preserved after publishing.

## Main pages
Public: landing/browse, listing detail. Auth: sign-up/login. User: create/edit listing, my listings, my introductions, private interested-people inbox, messages, group detail, account settings. Admin/moderation: minimal report review.

## MVP exclusions
No full Google Forms builder, Discord clone, voice/video, group chat, realtime presence/typing indicators, custom scheduling engine, fabricated scores/ratings, gamification, AI autonomous direct messaging, or production AI agents.

## AI scope
- Optional first AI task: assist with drafting a listing, show missing data, require human approval; never invent personal facts.
- Later AI matching: PostgreSQL pgvector semantic retrieval for **public listings**, combined with deterministic hard constraints such as availability, capacity, blocks. Compare against keyword baseline with curated tests; measure Precision@K, latency, and cost. Avoid unvalidated compatibility scores.

## Success metric
Study-start rate, not vanity signups. Also track listing-to-introduction conversion, responses, and time-to-match. Collect opt-in feedback from real matches, respecting privacy.

## Trust and safety
Start with adult-only service (proposed), email verification, reporting/blocking, rate limits, safeguards against spam/harassment, responsible contact sharing, privacy policy and moderated abuse reports before public beta.

## Design
Pastel purple/blue/mint, modern friendly cards, clean desktop/mobile layouts, approachable logo. Existing concept images are references rather than production specs. Copy any desired screenshots manually into `docs/design/` and provide their paths for Claude Code.
