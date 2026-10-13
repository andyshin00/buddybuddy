# How notifications work

What we built in M8: the bell in the header, and the notifications behind it.

## When one is created

| Something happens…                        | Who is told   | Text (example)                                              | Clicking it opens          |
| ----------------------------------------- | ------------- | ----------------------------------------------------------- | -------------------------- |
| Someone applies                           | the poster    | @sam applied for Backend on “StudySync”                     | the post's Pending tab     |
| The poster accepts / rejects / un-decides | the applicant | Your application for Backend on “StudySync” was accepted 🎉 | My applications            |
| Someone withdraws                         | the poster    | @sam withdrew their application for Backend on “StudySync”  | the post's applicants page |

Clicking a status the application already has (Accept on an accepted one) changes nothing, so nobody is notified.

## Code map

| File                                                          | What it does                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `src/server/db/schema.ts` (`notification`)                    | The table. `readAt` is empty until it's read                             |
| `src/server/db/migrations/0006_notifications.sql`             | The generated migration                                                  |
| `src/features/notifications/rules.ts`                         | Pure: the sentence and link for each kind, and the "9+" badge (tested)   |
| `src/features/notifications/create.ts`                        | `notify(tx, userId, notice)`: saves one, inside the caller's transaction |
| `src/features/notifications/queries.ts`                       | `getNotifications(viewer)`: your 20 newest + how many are unread         |
| `src/features/notifications/actions.ts`                       | `markAllRead()`: the only Server Action                                  |
| `src/features/notifications/components/notification-bell.tsx` | The bell and its dropdown (a client component)                           |

## Saved in the same transaction

Each notification is created **inside the transaction of the action that caused it**: `applyToPost`, `withdrawApplication` and `setApplicationStatus`. So it's all-or-nothing: you can never get "Sam applied" if saving Sam's application failed, and an application can't be saved without its notification.

## Why `notify()` isn't a Server Action

Every function exported from a `"use server"` file can be called **from the browser**, by anyone, with any arguments. If `notify` lived there, anyone could send any text to any user. So it lives in `create.ts`, marked `import "server-only"`, and only our own actions can call it. We checked: it doesn't appear in the build's list of Server Actions.

`markAllRead()` _is_ a Server Action, and that's safe: it takes no arguments and only touches the viewer's own rows.

## The text is saved, not rebuilt

Like application answers, the sentence is saved as it was. If the post is renamed later, old notifications still read correctly.

## The bell

- The header (a Server Component) loads your notifications and passes them to `NotificationBell`.
- The dropdown is a plain `<details>` element, so opening and closing works with almost no code.
- **Opening it marks everything read**: the red number disappears at once, and `markAllRead()` updates the database. The blue dots stay until the next page load, so you can still see which ones were new.
- Each "3 hours ago" is worked out on the server and passed down as text, so the server and browser never disagree about the time.

**Limit:** the bell updates when a page loads or after you do something. It doesn't update live while you sit on a page. Live updates would need polling or a push connection, which isn't needed yet.

## Demo data

`npm run db:seed` creates the notifications the demo applications would have sent. Pending applications are still unread for their posters, and Sam's rejection is unread for Sam, so a badge shows on first load.

## What we tested live

- Maya's bell shows her 1 unread; Sam's shows 2. Jordan never sees anyone else's.
- Sam withdrew → Maya got "@sam withdrew…". Sam applied again → Maya got "@sam applied…", unread, linking to the Pending tab.
- Maya clicked Accept **twice** → Sam got exactly one "accepted 🎉".
- Sam's `markAllRead` set Sam's unread to 0 and left Maya's untouched.
