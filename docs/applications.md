# How applying works

What we built in M6: applying to a post, and the "My applications" page.

## The journey of an application

1. On a post page, anyone except the owner sees **Apply**, or a greyed-out button with the reason they can't (see below).
2. **Apply** opens `/posts/[id]/apply`: pick an open role, answer the post's questions, add an optional message.
3. **Send application** saves it with status **pending** and takes you to **My applications** (`/applications`).
4. While it's pending, you can **Withdraw** it. That deletes it, so you could apply again later.
5. The poster accepts or rejects it (see [reviewing.md](reviewing.md)). Once accepted, you see the poster's contact details right here.

## Who can apply: `getApplyBlocker()`

One pure function in `src/features/applications/rules.ts` decides. The checks run in order, and the first one that fails is the reason shown:

| Check                                   | Message                                                          |
| --------------------------------------- | ---------------------------------------------------------------- |
| Is it your own post?                    | This is your post.                                               |
| Did you already apply?                  | You’ve already applied to this project.                          |
| Is the post closed?                     | This post is closed to new applications.                         |
| Are all roles filled?                   | All roles on this project have been filled.                      |
| Do you have the required profile links? | This post requires GitHub on your profile. (+ a link to edit it) |

The required-links check only looks at whether the link **exists**, even if it's private. That's the rule in `privacy.md`.

The post page, the apply page **and** the Server Action all use the same function, so the button and the server can never disagree.

## A Zod schema built on the fly

Every post asks different questions, so there can't be one fixed schema for answers. `buildAnswersSchema(questions)` in `schemas.ts` builds one for **this post's** questions when someone applies:

| Question type | Rule                                          |
| ------------- | --------------------------------------------- |
| Short text    | up to 200 characters                          |
| Long text     | up to 3000 characters                         |
| Dropdown      | must be one of the poster's choices           |
| Checkboxes    | each tick must be one of the poster's choices |
| Yes / No      | "Yes" or "No"                                 |

A required question must be answered; an optional one may be left empty.

## Answers are saved with a copy of the question

The `application` table stores answers like this (the `answers` column, as JSON):

```json
[
  {
    "questionId": "…",
    "label": "Which frontend frameworks have you used?",
    "type": "multi",
    "value": ["React", "Vue"]
  }
]
```

The question's text is copied next to the answer. If the poster edits or deletes questions later, old applications still read correctly. The same goes for the role: `role_name` is copied too.

## The database's last word

- **One application per person per post**: a unique index on `(post_id, applicant_id)`. Even if someone double-clicks Send, the second one is refused.
- **Withdrawing** deletes the row only if it's yours **and** still pending. That condition is in the SQL itself, so there's no way around it.

## Never trust what the browser sends

The apply form is tied to its post with `applyToPost.bind(null, postId)`. That post id travels through the browser in plain text, and **anyone can change it**. So the action never trusts it: it loads the post again and re-runs every check.

We tested this. We changed the id in the form to a **closed** post: the server answered "This post is closed to new applications." and saved nothing. We also tried withdrawing someone else's application: nothing was deleted, while the same request on our own application worked.

## Demo data

`npm run db:seed` adds the prototype's 10 applications (pending, accepted and rejected), with their answers.
