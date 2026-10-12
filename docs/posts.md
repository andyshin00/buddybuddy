# How posts work

What we built in M4: creating, editing, closing and browsing posts (the projects people want help with).

## The pages

| Page               | Who can open it | What it does                                                    |
| ------------------ | --------------- | --------------------------------------------------------------- |
| `/`                | everyone        | Signed out: a welcome screen. Signed in: the list of open posts |
| `/posts/new`       | signed-in users | The "New post" form                                             |
| `/posts/[id]`      | signed-in users | One post. Its owner also sees **Edit** and **Close / Reopen**   |
| `/posts/[id]/edit` | the owner only  | The same form, filled in. Anyone else gets "not found"          |

## The tables

| Table        | One row per…                                          |
| ------------ | ----------------------------------------------------- |
| `post`       | project                                               |
| `post_role`  | role a project needs ("Frontend", "Designer")         |
| `post_skill` | skill a project asks for, marked `required` or `nice` |

Creating or editing a post writes to all three, so it's one **transaction** (all or nothing), just like saving a profile.

Roles are kept **by name** when you edit. If you keep "Frontend" and add "Designer", "Frontend" stays the same row. That matters from M6 on, when applications point at a role.

## Owner-only actions, and why "not found"

Editing, closing and reopening are only for the post's owner. The check is one small rule, `canManagePost()` in `src/features/posts/rules.ts`, used by `getOwnPost()` in `queries.ts`.

If you try to edit someone else's post, you get **"not found"**, the same page as for a post that doesn't exist. Saying "you're not allowed" would confirm the post exists; "not found" reveals nothing.

The check runs **inside every Server Action**, not just on the page. Hiding the Edit button isn't enough: someone could send the request by hand. We tested exactly that. The same "close this post" request works on your own post and is refused for someone else's.

`queries.test.ts` proves it in code, using a **fake database**: we give `getOwnPost()` a post owned by Maya and check that Sam gets `null` (→ the 404 page).

## Browsing and filters live in the URL

The filter bar is a plain form with `method="GET"`. Submitting it doesn't call a Server Action; it just changes the address:

```
/?search=game&type=need-builders&skills=React,Unity&maxHours=10
```

The home page reads those **search params**, checks them with Zod (`parseBrowseFilters`), and `searchPosts()` turns each one into a piece of SQL:

| URL param  | Becomes (roughly)                                          |
| ---------- | ---------------------------------------------------------- |
| `search`   | title or description contains the text (ignoring capitals) |
| `type`     | `type = 'ideate'`                                          |
| `duration` | `duration = 'weekend'`                                     |
| `maxHours` | `hours_per_week <= 10`                                     |
| `skills`   | the post has **any** of these skills                       |

All filters combine (AND), and only **open** posts are listed, newest first.

Why the URL? A filtered list can be bookmarked, shared or refreshed, and the Back button works. Invalid values in the URL (like `?maxHours=lots`) are simply ignored.

## Empty states

When the list is empty, the page says _why_ and what to do next: "No posts match these filters" with a **Clear filters** link, or "No open projects yet" with a link to create one.

## Demo data

`npm run db:seed` now adds the prototype's 8 posts (7 open, 1 closed), so the browse page has something to show.

## Application questions (M5)

A post can ask applicants up to 10 questions. They're saved in the `post_question` table, one row per question, with a `position` for the order.

| Type       | The applicant…              | Needs choices? |
| ---------- | --------------------------- | -------------- |
| Short text | types one line              | no             |
| Long text  | types a paragraph           | no             |
| Dropdown   | picks one choice            | yes, 2–10      |
| Checkboxes | ticks any number of choices | yes, 2–10      |
| Yes / No   | picks yes or no             | no             |

### How the editor works

The question editor (`components/question-editor.tsx`) is the first part of the app that really needs JavaScript in the browser: adding, removing and moving questions happens instantly, without a round trip to the server. It keeps the list in React **state** (`useState`).

When you submit the post form, the editor's list goes along as **one hidden field** called `questions`, containing the list as JSON text. The Server Action reads that field, and `questionsSchema` (in `schemas.ts`) turns it back into a list and checks it: a label for every question, 2–10 different choices for dropdowns and checkboxes, at most 10 questions. Error messages name the question number, like "Question 2: write the question."

The server never trusts the editor. Someone could send any JSON they like, so the same checks run there.

### Templates

`templates.ts` holds four ready-made question sets (Web app, Mobile app, Game, General), ported from the prototype. **Insert template** adds a set's questions to the end of your list, and then you edit them like any others. To add a template, add an object to `QUESTION_TEMPLATES`; a test checks that every template passes the same rules as a poster's own questions.

### Editing questions later

Saving a post replaces its whole question list. That's safe because, from M6, each application will keep its own copy of the questions it answered (see "Why answers are a jsonb snapshot" in `architecture.md`).
