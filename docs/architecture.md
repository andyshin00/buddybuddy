# Architecture

## Folder layout (target — folders appear as milestones add them)

```
src/
  app/                          routes only: thin pages + layouts
    (public)/page.tsx           browse
    (app)/...                   signed-in area; layout checks the session
    api/auth/[...all]/route.ts  Better Auth handler (the only API route)
  features/                     one folder per domain area
    posts/
      queries.ts                reads   (import 'server-only')
      actions.ts                writes  ('use server' Server Actions)
      schemas.ts                Zod schemas shared by forms + actions
      rules.ts                  pure business rules (unit tested)
      components/               UI used only by this feature
    applications/  profiles/  notifications/   (same shape)
  server/
    db/
      schema.ts                 Drizzle tables, enums, relations
      index.ts                  db client
      migrations/               generated SQL — committed, never hand-edited
      seed.ts                   dev demo data
    auth.ts                     Better Auth config + getViewer()
  proxy.ts                      redirects signed-out visitors (cookie check only)
  components/ui/                shadcn/ui components (we own this code)
  lib/                          small utils safe on client AND server
  env.ts                        Zod-validated environment variables
```

## Rules, and why

1. **`app/` is routes only.**
   - A page fetches data by calling a query, then renders components. That's it.
   - _Why:_ when logic lives in pages, it gets duplicated and becomes hard to test.

2. **Reads are queries; writes are Server Actions.**
   - Server Components can `await` data directly, so there's no `useEffect` + fetch + API route + `setState` chain.
   - Server Actions are called from forms; after a write they call `revalidatePath` so pages show fresh data.
   - _Why:_ less code, no loading flicker, and secrets never reach the browser.

3. **Authorization lives in the data layer.**
   - Every query and action receives the `viewer` (from `getViewer()`) and checks access itself.
   - _Why:_ in a previous project, `GET /api/videos/[id]` checked that you were _logged in_ but not that the video was _yours_. Anyone could read anyone's data by changing the id. That bug class is called an **IDOR**.
   - If the check lives next to the database call, no page can forget it.
   - Return "not found" for things the viewer may not see, so attackers can't tell that a resource exists.

   ```ts
   // features/applications/queries.ts
   export async function getApplicantsForPost(viewer: Viewer, postId: string) {
     const post = await db.query.post.findFirst({ where: eq(post.id, postId) });
     if (!post || post.ownerId !== viewer.id) notFound();
     // ...only now load applications
   }
   ```

4. **Business rules are pure functions** (`rules.ts`).
   - Examples: `getApplyBlocker(post, user, alreadyApplied)`, `validateAnswers(questions, answers)`, skill matching.
   - They take plain data and return plain data: no database, no React.
   - _Why:_ trivial to unit-test, and the UI (to disable a button) and the action (to enforce it) share the same logic.

5. **One Zod schema per form**, used for client-side feedback _and_ server validation.
   - _Why:_ the server must never trust the browser, but you shouldn't write validation twice.

6. **Multi-table writes run in a transaction.**
   - Example: accept application → update its status → mark the role filled → insert a notification.
   - _Why:_ if one step fails, none of them happen, so data is never half-updated.

7. **Filters live in the URL** (`/?type=ideate&skills=react,node&maxHours=5`).
   - _Why:_ shareable links, back/forward work, and the server can render the filtered list.

8. **Environment variables are validated once**, in `src/env.ts`.
   - _Why:_ a missing `DATABASE_URL` fails at startup with a clear message, not as a confusing `undefined` deep inside a request.

## Request flows

```
Read:   page.tsx (Server Component)
          → getViewer()
          → features/x/queries.ts  (authz check → Drizzle)
          → render components

Write:  <form action={createPost}>
          → features/x/actions.ts  ('use server')
              1. getViewer()           → must be signed in
              2. schema.safeParse()    → validate input
              3. authorization check   → may this viewer do this?
              4. rules.ts              → business rules
              5. db.transaction(...)   → write
              6. revalidatePath(...)   → refresh affected pages
          → return { ok } | { error, fieldErrors }
```

## Data model (Drizzle, uuid primary keys, Postgres enums)

| Table                                        | Key columns                                                                                                            | Notes                           |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `user`, `session`, `account`, `verification` | —                                                                                                                      | Managed by Better Auth          |
| `profile`                                    | userId (PK, FK), username (unique), displayName, headline, bio, experience, hoursPerWeek, timezone                     | Public                          |
| `profile_private`                            | userId, realName, githubUrl, linkedinUrl, portfolioUrl, email, discord, public link flags                              | See [privacy.md](privacy.md)    |
| `skill`                                      | id, name (unique, case-insensitive)                                                                                    | Shared tag list                 |
| `profile_skill`                              | userId, skillId                                                                                                        | many-to-many                    |
| `post`                                       | id, ownerId, title, description, type, status, hoursPerWeek, duration, timezone, requiredLinks[], createdAt, updatedAt |                                 |
| `post_skill`                                 | postId, skillId, kind (required \| nice)                                                                               |                                 |
| `post_role`                                  | id, postId, name, filled                                                                                               |                                 |
| `post_question`                              | id, postId, position, type, label, required, options (jsonb)                                                           |                                 |
| `application`                                | id, postId, applicantId, roleId, status, message, answers (jsonb snapshot), createdAt, updatedAt                       | **unique(postId, applicantId)** |
| `notification`                               | id, userId, kind, text, link, readAt, createdAt                                                                        |                                 |

**Why answers are a jsonb snapshot.** A poster may edit their questions after people have applied. If answers only pointed at question ids, old applications would show the wrong labels or lose answers. Storing `{ questionId, label, type, value }` keeps each application readable forever.
