import { z } from "zod";

// Every environment variable the app reads is declared and checked here.
// Other files import `env` from this module; nothing else reads process.env.
// Where to get each value: see .env.example.
const envSchema = z.object({
  // Neon Postgres connection string
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),

  // Better Auth: signs the session cookie. Long random string, never shared.
  BETTER_AUTH_SECRET: z.string().min(32),
  // The site's own address, e.g. http://localhost:3000. Optional: on Vercel
  // preview deploys it's left unset and Better Auth works it out per request.
  BETTER_AUTH_URL: z.url().optional(),

  // OAuth apps (the "Sign in with ..." buttons)
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(parsed.error)}`,
  );
}

export const env = parsed.data;
