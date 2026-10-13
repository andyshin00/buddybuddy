# How reviewing works

What we built in M7: the poster's side of applications. "My posts", the applicants page, accept / reject, marking roles filled, and "projects joined" on profiles.

## The journey

1. **My posts** (`/my-posts`, in the header) lists your posts with how many people applied and how many are still **pending**.
2. **Review applicants** (on your post, or the applicant count on My posts) opens `/posts/[id]/applicants`.
3. Each applicant shows their role, availability, **skill match**, links, answers and message.
4. **Accept**, **Reject**, or **Move back to pending**. When accepting, you can tick "Also mark _role_ as filled".
5. Once accepted, **both of you see each other's contact details**: you on the applicants page, them on My applications. Their profile then lists your project under **Projects joined**.

## Code map

| File                                                  | What it does                                                          |
| ----------------------------------------------------- | --------------------------------------------------------------------- |
| `src/features/reviewing/rules.ts`                     | Pure rules: `skillMatch`, `countByStatus`, `statusChoices` (tested)   |
| `src/features/reviewing/queries.ts`                   | `getMyPosts` (with counts), `getApplicantsForReview` (owner-only)     |
| `src/features/reviewing/actions.ts`                   | `setApplicationStatus`: accept / reject / pending, in a transaction   |
| `src/features/posts/actions.ts`                       | `setRoleFilled`: mark a role filled or open again                     |
| `src/features/profiles/rules.ts`                      | `relationshipFrom`: who counts as a collaborator or reviewer (tested) |
| `src/features/profiles/queries.ts`                    | `getPrivateProfiles`: the privacy gate, now for a whole list at once  |
| `src/app/my-posts/`, `src/app/posts/[id]/applicants/` | The two new pages                                                     |

## Contact details: shown because of a rule, not a button

There's no "reveal contact" code anywhere. Accepting someone just changes the application's `status` to `accepted`. The privacy gate (`getPrivateProfiles`) then works out that you two are **collaborators** and includes the contact fields:

| Applications between you and them               | You are their… | You see                |
| ----------------------------------------------- | -------------- | ---------------------- |
| None                                            | stranger       | only public links      |
| They applied to your post (pending or rejected) | reviewer       | all their links        |
| An accepted one, in either direction            | collaborator   | links + name + contact |

So moving someone back to pending hides their contact again, automatically. We tested it.

## Only the owner can review

- The applicants page uses `getOwnPost`, so for anyone else the post "doesn't exist" and they get a 404.
- `setApplicationStatus` finds the application **joined with its post, where the post's owner is you**. If it's not your post, nothing matches and nothing changes.
- `setRoleFilled` checks you own the post, and its `WHERE` also needs the role to belong to **that** post.

## One transaction

Accepting with "mark role filled" changes `application` and `post_role`. They run inside `db.transaction(...)`: either both are saved, or (if anything fails) neither is. Since M8, the notification for the applicant is saved in the same transaction too (see [notifications.md](notifications.md)).

## `refresh()` instead of `redirect()`

After a status change, the action calls `refresh()` from `next/cache`. It re-renders the page you're on, **keeping the URL**, so you stay on the same tab (`?status=pending`). Earlier actions used `redirect()` because they sent you somewhere new.

## Tabs live in the URL

All / Pending / Accepted / Rejected are plain links to `?status=…`. The page reads it with `reviewTabSchema`, which falls back to "All" for anything unexpected. The counts on each tab come from one list of applicants, filtered in the page; a single post's applicants are a short list, so one query is enough.

## What we tested live

Signed in as the demo users, on StudySync (Maya's post):

- Maya sees both applicants. Priya (accepted) shows her email; Sam (pending) shows his links but **his email isn't anywhere in the HTML**.
- Jordan opening the applicants page gets "not found".
- **Attack:** Sam submitted Maya's own Accept button for his application, with his session. Nothing changed. Same for "Mark filled".
- Maya accepts Sam with "mark role filled": both changes saved. Sam now sees Maya's email on My applications and her profile; Jordan still doesn't.
- Back to pending: Sam's and Maya's contacts are hidden from each other again.
