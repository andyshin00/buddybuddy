# How profiles work

What we built in M3, and the ideas behind it. For the rules themselves, see [privacy.md](privacy.md).

## The pages

| Page                | Who can open it                  | What it does                                     |
| ------------------- | -------------------------------- | ------------------------------------------------ |
| `/u/[username]`     | anyone signed in with a username | Shows a profile. Your own has an **Edit** button |
| `/settings/profile` | you, for your own profile only   | The edit form                                    |

`[username]` in a folder name means "any value goes here". `/u/maya` and `/u/jordan` both use the same `src/app/u/[username]/page.tsx`, which reads the name from the URL.

## Public vs private: two tables

| Table             | Holds                                                              | Who sees it                      |
| ----------------- | ------------------------------------------------------------------ | -------------------------------- |
| `profile`         | username, display name, headline, bio, experience, hours, timezone | every signed-in user             |
| `profile_skill`   | which skills a profile lists                                       | every signed-in user             |
| `profile_private` | real name, GitHub / LinkedIn / portfolio links, email, Discord     | depends on who's looking (below) |

Keeping private details in **their own table** makes mistakes harder: a query for public data can't accidentally include a private column, because that column isn't even in the table it reads.

## Who sees private details

This is **authorization**: deciding what someone is _allowed_ to see. It all happens in one function, `visiblePrivateDetails()` in `src/features/profiles/rules.ts`:

| The viewer is… | Real name, email, Discord | Links                           |
| -------------- | ------------------------- | ------------------------------- |
| you (`self`)   | ✓                         | all                             |
| a collaborator | ✓                         | all                             |
| a reviewer     | ✗                         | all                             |
| anyone else    | ✗                         | only the ones you marked public |

- **Collaborator** = one of you accepted the other's application. **Reviewer** = they applied to your post, so you're reviewing them. Both are worked out from the `application` table by `relationshipFrom()` (also a pure function, also tested).
- It's a **pure function**: it gets data in and returns data out, with no database. That makes it easy to test every row of the table above (`rules.test.ts`).
- Fields the viewer can't see are **left out completely**, not hidden on the page. If something is in the HTML, anyone can read it with "View source".

The page never reads `profile_private` directly. It calls `getPrivateProfile(viewer, userId)` in `queries.ts`, which loads the row, works out the relationship, and applies the rule. For a list of people (like the applicants page) there's `getPrivateProfiles(viewer, userIds)`, which does the same for everyone in 2 queries. They're the only two ways in.

## Saving the edit form

The form calls the `updateProfile` **Server Action** (`src/features/profiles/actions.ts`). A Server Action is a function that runs on the server when a form is submitted, so there's no API route to write.

It does the same four steps as every write in this project:

1. **Who's asking?** `requireProfile()`. You can only ever edit your _own_ profile: the action uses the signed-in user's id, never an id sent by the form.
2. **Is the input valid?** `profileFormSchema` (Zod) checks every field: https-only links, hours between 1 and 168, a timezone from the list, up to 20 skills. On failure the form shows an error under each bad field and keeps what you typed.
3. **Save it in one transaction.** Three tables change (`profile`, `profile_private`, `profile_skill`). A **transaction** means "all or nothing": if any step fails, none of the changes are kept, so you never end up with half a profile.
4. **Go to the profile page** to see the result.

### Skills

Skills are typed as a comma-separated list: `React, TypeScript, Figma`. On save:

- duplicates are removed (`react, React` → one),
- skills nobody has used before are added to the `skill` table,
- existing ones are reused, ignoring capitals (typing `react` links to the existing `React`).

## Demo data

`npm run db:seed` gives the 6 demo users private details. Some of their links are public (for example Maya's GitHub), so you can see the difference: visit `/u/maya` and you'll see her GitHub link, but not her LinkedIn, real name or email.
