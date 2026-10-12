# How sign-in works

This guide explains BuddyBuddy's sign-in from zero: the ideas, the files, and the one-time setup. Read Part 1 for the ideas. Part 3 has the setup steps.

---

## Part 1: The ideas

### Authentication vs authorization

- **Authentication** = _who are you?_ (signing in)
- **Authorization** = _what are you allowed to do?_ (e.g. only the owner can edit a post)

This guide is about authentication. Authorization comes in later milestones.

### Why we don't store passwords

Storing passwords safely is hard: hashing, reset emails, leaked-password checks. Instead, we let **GitHub** or **Google** check who someone is. They already have the person's password; we never see it.

### OAuth: "Sign in with GitHub"

**OAuth** is the standard way one website (BuddyBuddy) asks another (GitHub) _"who is this person?"_. You've used it whenever you clicked "Continue with Google" somewhere.

Think of a hotel:

- GitHub is the **front desk** that checks your ID.
- BuddyBuddy is a **room** that only trusts key cards from that front desk.
- You never show your ID to the room. You show the key card.

Here's what happens when someone clicks **Continue with GitHub**:

```
 You (browser)            BuddyBuddy                    GitHub
      │                       │                            │
 1.   │── click button ──────►│                            │
 2.   │◄── "go to GitHub" ────│                            │
 3.   │──────────── log in + "Allow BuddyBuddy?" ─────────►│
 4.   │◄──────────── "go back to BuddyBuddy" + a code ─────│
 5.   │── here's the code ───►│                            │
 6.   │                       │── code + our secret ──────►│
 7.   │                       │◄── name, email, avatar ────│
 8.   │◄── session cookie ────│  (user saved in database)  │
```

- Step 4's address is the **callback URL**: `/api/auth/callback/github`. GitHub only sends people back to a callback URL you registered in advance, so nobody can steal the code by pretending to be BuddyBuddy.
- Step 6 uses the **client secret**, a password that only our server and GitHub know. That's why it lives in `.env.local` and never in the browser.

### OAuth app, client ID, client secret

To use "Sign in with GitHub", you register BuddyBuddy with GitHub once. This is called an **OAuth app**. GitHub gives you:

| Value             | What it is                                     | Secret?                  |
| ----------------- | ---------------------------------------------- | ------------------------ |
| **Client ID**     | BuddyBuddy's public name tag at GitHub         | No (it appears in URLs)  |
| **Client secret** | BuddyBuddy's password at GitHub (step 6 above) | **Yes**: never commit it |

Google works the same way. It calls the app an **OAuth client**.

### Sessions and cookies

After step 8, how does the site remember you on the next page?

- A **session** is a row in the `session` table saying "this token belongs to user X, until this date".
- A **cookie** is a small value your browser automatically sends back with every request. Ours holds the session token.
- Each request: read the cookie → find the session → now we know who you are.
- **Signing out** deletes the session row and the cookie.

The cookie is **signed** with `BETTER_AUTH_SECRET`, so nobody can edit it to pretend to be someone else.

### Better Auth

**Better Auth** is the library that does all of the above for us: the redirects, the callback, creating the user, sessions and cookies. We configure it in one file (`src/server/auth.ts`) and it saves everything through Drizzle.

### Account linking

If you sign in with GitHub today and with Google next week, using **the same email**, Better Auth connects both to **one** BuddyBuddy user instead of creating two.

It only does this when GitHub/Google confirm the email is **verified**. Otherwise someone could create a Google account with _your_ email and take over your BuddyBuddy account.

---

## Part 2: What we built

### The database tables

Better Auth needs four tables (`src/server/db/schema.ts`, migration `0001_auth_tables.sql`):

| Table          | One row per…                          | Example                             |
| -------------- | ------------------------------------- | ----------------------------------- |
| `user`         | person                                | Maya, maya@example.com              |
| `account`      | sign-in method a person has connected | Maya's GitHub; Maya's Google        |
| `session`      | signed-in browser                     | Maya on her laptop, until next week |
| `verification` | temporary value during sign-in        | (Better Auth uses it internally)    |

`profile` now points at `user`: every profile belongs to a real user, and deleting a user deletes their profile.

### The files

| File                                         | What it does                                                                            |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/server/auth.ts`                         | Better Auth setup, plus `getViewer()`, `requireViewer()` and `requireProfile()` (below) |
| `src/app/api/auth/[...all]/route.ts`         | Hands every `/api/auth/...` URL to Better Auth (including the callback URLs)            |
| `src/features/auth/actions.ts`               | Server Actions: `signInWith("github" \| "google")` and `signOut()`                      |
| `src/app/sign-in/page.tsx`                   | The sign-in page with the two buttons                                                   |
| `src/features/auth/components/user-menu.tsx` | Header: "Sign in", or your @username and "Sign out"                                     |
| `src/app/onboarding/page.tsx`                | "Choose a username" page for new users                                                  |
| `src/features/profiles/actions.ts`           | `createProfile`: saves the username (creates the `profile` row)                         |
| `src/features/profiles/schemas.ts`           | The username rules (shared by the form and the action), with tests                      |
| `src/proxy.ts`                               | Sends signed-out visitors away from pages that need sign-in                             |

### The helpers you'll use in every later feature

```ts
const viewer = await getViewer(); // who's signed in, or null
const viewer = await requireViewer(); // must be signed in, else → /sign-in
const viewer = await requireProfile(); // must have a username, else → /onboarding
```

The "viewer" is the person looking at the page. Every page and action that needs to know who's asking calls one of these.

### The full journey of a new user

1. They click **Sign in** → `/sign-in` → **Continue with GitHub**.
2. The `signInWith` Server Action asks Better Auth for GitHub's login URL and sends the browser there.
3. They approve on GitHub. GitHub sends them back to `/api/auth/callback/github`.
4. Better Auth creates rows in `user`, `account` and `session`, and sets the cookie.
5. Because they're **new**, they land on `/onboarding`. (Returning users land on `/`.)
6. They pick a username. `createProfile` checks it, saves it, and sends them to `/`.
7. The header now shows `@theirname`.

Until step 6 is done, the header shows **Finish setting up**, and any page that uses `requireProfile()` sends them back to onboarding.

### Two layers of protection

- **`proxy.ts`** runs _before_ the page. It only checks that a session cookie **exists**. That's fast, but a cookie could be expired or fake.
- **`requireViewer()`** runs _inside_ the page or action and checks the session **in the database**. That's the real check.

The proxy is the bouncer at the door, and `requireViewer()` checks your ticket at your seat. **Never rely on the proxy alone.**

### Why `<Suspense>` around the user menu

Reading the cookie can only happen when a real request arrives, not when the site is built. `<Suspense>` lets Next.js send the rest of the page right away and fill in the user menu a moment later.

---

## Part 3: One-time setup

You need **three OAuth registrations** and some settings in two places.

|                  | On your computer (`.env.local`) | Production (Vercel) |
| ---------------- | ------------------------------- | ------------------- |
| GitHub OAuth app | "BuddyBuddy (dev)"              | "BuddyBuddy"        |
| Google client    | one client, used for both       | (same one)          |

GitHub needs two apps because each one allows only **one** callback URL. Google allows several, so one is enough.

**First, find your production address.** In Vercel, open your project → **Settings** → **Domains**. You'll see something like `buddybuddy-abc123.vercel.app`.

> **`PROD` below is a placeholder, not something to type.** Replace it with `https://` + your address. For example, `PROD/api/auth/callback/github` becomes `https://buddybuddy-abc123.vercel.app/api/auth/callback/github`.

### Step 1: GitHub OAuth apps

1. Go to github.com → your avatar → **Settings** → **Developer settings** (bottom of the left menu) → **OAuth Apps** → **New OAuth App**.
2. Fill in:
   - **Application name:** `BuddyBuddy (dev)`
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github`
3. Click **Register application**.
4. Copy the **Client ID** into `.env.local` as `GITHUB_CLIENT_ID=`.
5. Click **Generate a new client secret**. Copy it **now**, because GitHub only shows it once. Put it in `.env.local` as `GITHUB_CLIENT_SECRET=`.
6. Repeat steps 1–3 for production:
   - **Application name:** `BuddyBuddy`
   - **Homepage URL:** `PROD`
   - **Authorization callback URL:** `PROD/api/auth/callback/github`

   Keep its Client ID and a new secret somewhere safe for Step 3 (don't put them in `.env.local`).

### Step 2: Google OAuth client

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a project called `BuddyBuddy` (project picker at the top → **New project**).
2. Open the menu → **Google Auth Platform** → **Get started**:
   - **App name:** `BuddyBuddy`, **support email:** your email
   - **Audience:** External
   - **Contact email:** your email → agree → **Create**
3. Go to **Clients** → **Create client**:
   - **Application type:** Web application
   - **Name:** `BuddyBuddy`
   - **Authorized JavaScript origins:** add `http://localhost:3000` and `PROD`
   - **Authorized redirect URIs:** add `http://localhost:3000/api/auth/callback/google` and `PROD/api/auth/callback/google`
   - Click **Create**.
4. Copy the **Client ID** and **Client secret** into `.env.local` as `GOOGLE_CLIENT_ID=` and `GOOGLE_CLIENT_SECRET=`.
5. Go to **Audience**. The app starts in **Testing** mode, where only listed **test users** can sign in. Either add your Google email under **Test users**, or click **Publish app** so anyone can sign in. (We only ask for name, email and picture, so Google doesn't need to review it.)

### Step 3: Vercel settings

In Vercel → your project → **Settings** → **Environment Variables**, add these. For each one, tick **only** the environment shown.

**Production:**

| Key                    | Value                                                                |
| ---------------------- | -------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET`   | a **new** random secret (command below). Not the one in `.env.local` |
| `BETTER_AUTH_URL`      | `PROD`                                                               |
| `GITHUB_CLIENT_ID`     | from the **"BuddyBuddy"** GitHub app                                 |
| `GITHUB_CLIENT_SECRET` | from the **"BuddyBuddy"** GitHub app                                 |
| `GOOGLE_CLIENT_ID`     | from Google                                                          |
| `GOOGLE_CLIENT_SECRET` | from Google                                                          |

**Preview:**

| Key                    | Value                     |
| ---------------------- | ------------------------- |
| `BETTER_AUTH_SECRET`   | another new random secret |
| `GITHUB_CLIENT_ID`     | same as your `.env.local` |
| `GITHUB_CLIENT_SECRET` | same as your `.env.local` |
| `GOOGLE_CLIENT_ID`     | same as your `.env.local` |
| `GOOGLE_CLIENT_SECRET` | same as your `.env.local` |

To make a random secret, run this in your terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

> **Why do previews need these?** The app checks all its settings when it starts (`src/env.ts`), so a preview without them fails to build. Sign-in itself **won't work on preview links**, because each preview has a different address that isn't registered with GitHub or Google. Test sign-in locally or on production.

### Step 4: Try it locally

```bash
npm run dev
```

Open http://localhost:3000 → **Sign in** → **Continue with GitHub** → approve → pick a username. The header should show `@yourname`. Then try **Sign out**, and sign in again with **Google**: if your Google email matches your GitHub email, you'll land back on the same account (account linking).

---

## Troubleshooting

| What you see                                        | Likely cause                                                                                           |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `Invalid environment variables` when starting       | A value in `.env.local` is empty or missing. The message names it                                      |
| GitHub: "The redirect_uri is not associated…"       | The callback URL in the GitHub app doesn't exactly match (check `http` vs `https`, and the port)       |
| Google: "Error 400: redirect_uri_mismatch"          | Same, in Google's **Authorized redirect URIs**                                                         |
| Google: "Access blocked… has not completed testing" | Add your email as a test user, or publish the app (Step 2.5)                                           |
| Error page saying `account_not_linked`              | Your GitHub and Google emails match, but one of them isn't verified, so linking was refused for safety |
