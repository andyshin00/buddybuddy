import { z } from "zod";

// Every environment variable the app reads is declared and checked here.
// Other files import `env` from this module; nothing else reads process.env.
const envSchema = z.object({
  // Neon Postgres connection string (see .env.example)
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${z.prettifyError(parsed.error)}`,
  );
}

export const env = parsed.data;
