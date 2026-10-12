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
