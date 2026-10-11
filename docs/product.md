# Product spec

BuddyBuddy helps people find collaborators for side projects. It starts with CS students and software developers. It works like a job board, but for projects.

This spec carries over the original prototype requirements; the changes for v2 are listed at the end. The prototype's code is in [reference/prototype/](reference/prototype/).

## Users & profiles

- Sign in with **GitHub or Google** (Better Auth). On first sign-in, the user picks a unique **username**.
- A profile has:
  - username and an optional display name, with an initials avatar (or the OAuth avatar)
  - short bio and school/role headline
  - skills (tags) and experience level: Beginner / Intermediate / Advanced
  - availability: hours per week + timezone
- **Private fields:** real name, GitHub / LinkedIn / portfolio links, and contact info (email, Discord). Visibility rules are in [privacy.md](privacy.md).
- Anyone signed in can view a profile; only its owner can edit it.
- The profile shows the projects the user has **posted** and **joined** (accepted).

## Posts (projects)

- Fields:
  - title, description
  - **post type:** "Have an idea, need builders" / "Open to ideating together" / "Existing project, need a role filled"
  - **roles needed** (e.g. Frontend, Backend, Designer); each role can be marked **filled**
  - **required skills** and **nice-to-have skills** (tags)
  - **time commitment** (hours/week) and **expected duration** (weekend, ~2 weeks, ~1 month, ~3 months, 3+ months)
  - **timezone preference** (optional)
  - **required links:** which profile links applicants must have (GitHub, LinkedIn, portfolio)
  - **status:** Open / Closed
  - a **custom application form** (below)
- Only the owner can edit, close or reopen a post.

## Application form builder

- **Question types:**
  - dropdown (single choice, poster-defined options)
  - multiple choice (checkboxes)
  - short text
  - long text
  - yes/no
- Each question can be marked **required**. Questions can be added, removed and **reordered** (up/down buttons are fine).
- **Templates** the poster can insert and then edit: Web app, Mobile app, Game, General. They're kept in a data file so more are easy to add (see `reference/prototype/templates.ts`).

## Browsing

- The home page lists **open** posts as cards. Each card shows:
  - title, post type badge, open roles, skill tags, time commitment
  - poster, applicant count, age
- **Filters** (they all combine):
  - search text
  - post type
  - skills (multi-select, matches any)
  - max hours/week
  - duration
- The viewer's own posts show a **"Your post"** badge. Clicking a card opens the post detail page.

## Applying

- On a post page, a non-owner sees **Apply**. It's disabled, with the reason shown, if:
  - they already applied
  - the post is closed
  - all roles are filled
  - they're missing a required link (the message names the link and links to "edit profile")
- The apply form has:
  - a choice of **role** (open roles only)
  - the poster's **questions**, with required ones validated
  - an optional **message**
- The applicant's profile (skills, availability, links) is **attached automatically**.
- **"My applications"** lists the user's applications and their status. A **pending** one can be withdrawn.

## Reviewing (poster)

- **"My posts"** lists the user's posts with applicant and pending counts.
- The **applicants view** for each post shows, for each applicant:
  - name, the role they applied for, availability, links
  - **skill match**: which required skills they have (green) or lack (red), plus nice-to-haves
  - their answers to each question, and their message
- Tabs: All / Pending / Accepted / Rejected.
- Actions: **Accept**, **Reject**, or move back to **Pending**.
- **On accept:**
  - Both sides can now see each other's contact info.
  - The applicant sees "Accepted".
  - The poster can optionally mark that role as filled.

## Notifications

- Created for:
  - a new application (to the poster)
  - a status change (to the applicant)
  - a withdrawal (to the poster)
- The navbar shows an unread badge. A dropdown lists notifications; opening it marks them read, and clicking one goes to the relevant page.

## UX basics

- Clean, modern and readable. Works at laptop and phone widths.
- Every list has an **empty state** (no posts match the filters, no applicants yet, etc.).

## Changes from the prototype (v2)

| Prototype                          | v2                                                                                                                       |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Fake users + "Viewing as" switcher | Real accounts via GitHub / Google OAuth                                                                                  |
| Real full names shown publicly     | Public **username**; real name and links private until collaborating ([privacy.md](privacy.md))                          |
| localStorage                       | Neon Postgres via Drizzle, migrations                                                                                    |
| Rules checked in the browser       | Every read and write authorized on the server                                                                            |
| Answers stored by question id      | Answers stored as a **snapshot** (question label + type + value), so editing a form later doesn't break old applications |
| "Reset demo data" button           | `npm run db:seed` against the dev database only                                                                          |
