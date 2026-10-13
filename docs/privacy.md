# Privacy & identity

Many users are students. A public page that combines a full name, school, timezone, availability and a LinkedIn link is easy to scrape and can be used to track someone down. BuddyBuddy therefore uses a **username-first identity**. Personal details are revealed only to people you're actually collaborating with.

## Visibility rules

| Field                                             | Who can see it                                          |
| ------------------------------------------------- | ------------------------------------------------------- |
| Username, display name (optional), avatar         | Signed-in users                                         |
| Bio, skills, experience level                     | Signed-in users                                         |
| Availability (hours/week, timezone)               | Signed-in users                                         |
| School / role headline (optional, keep it coarse) | Signed-in users                                         |
| Real name                                         | Collaborators                                           |
| GitHub / LinkedIn / portfolio links               | Collaborators, **unless the owner marks a link public** |
| Email, Discord                                    | Collaborators                                           |

- **Collaborators:** two users with an **accepted** application between them, in either direction.
- **Reviewing exception:** while reviewing an application to _their own post_, a poster can see that applicant's links. Applying is consent to be reviewed.
- **Required links:** a post's "required links" only check that the link **exists** on the applicant's profile, not that it's public.
- **Verified GitHub:** users who signed in with GitHub can show a "verified GitHub" badge.

## Enforcement (non-negotiable)

- **Private fields live in `profile_private`, not `profile`.** Public queries never select from it.
- **They're only read through `getPrivateProfile(viewer, userId)` (or `getPrivateProfiles` for a list).** It applies the rules above on the server and has unit tests for every branch.
- **Never send a hidden field to the browser and hide it with CSS or conditionals.** If it's in the HTML or the JSON, it's public.
- **Profiles and posts require sign-in**, and write actions are rate-limited, to slow down scraping.
- **Only `https://` URLs are accepted** for links. This is validated on the server with Zod.

## Later (M9)

- Block / report users and posts.
- Account deletion: delete or anonymise the profile, keep other users' posts consistent.
- Data export; a privacy policy page; a minimum age (18+) in the terms.
