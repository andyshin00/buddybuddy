import "server-only";

import { sql } from "drizzle-orm";

import { db } from "./db";
import { rateLimit } from "./db/schema";

// How often one user may do each kind of write. Generous for real people,
// tight enough to stop a script from flooding the site.
export const RATE_LIMITS = {
  post: { max: 10, windowSeconds: 60 * 60 }, // new posts per hour
  apply: { max: 20, windowSeconds: 60 * 60 }, // applications per hour
  report: { max: 10, windowSeconds: 60 * 60 }, // reports per hour
  write: { max: 60, windowSeconds: 60 }, // anything else, per minute
} as const;

export type RateLimitAction = keyof typeof RATE_LIMITS;

export const TOO_MANY_REQUESTS =
  "You’re doing that too often. Wait a few minutes and try again.";

// Counts one more attempt and says whether the user is over the limit.
//
// "Fixed window": the first attempt starts a window; attempts inside it
// add 1; the first attempt after it ends starts a new window at 1. It's
// one INSERT … ON CONFLICT statement, so two requests at the same moment
// can't both read the old count (the database does them one at a time).
export async function isRateLimited(
  action: RateLimitAction,
  userId: string,
): Promise<boolean> {
  const { max, windowSeconds } = RATE_LIMITS[action];
  const expired = sql`${rateLimit.windowStart} <= now() - make_interval(secs => ${windowSeconds})`;

  const [row] = await db
    .insert(rateLimit)
    .values({ key: `${action}:${userId}`, windowStart: sql`now()`, count: 1 })
    .onConflictDoUpdate({
      target: rateLimit.key,
      set: {
        count: sql`case when ${expired} then 1 else ${rateLimit.count} + 1 end`,
        windowStart: sql`case when ${expired} then now() else ${rateLimit.windowStart} end`,
      },
    })
    .returning({ count: rateLimit.count });

  return row.count > max;
}

// For actions without a form to show a message in (plain buttons): stops
// the action with an error, which the error page (app/error.tsx) shows.
export async function enforceRateLimit(
  action: RateLimitAction,
  userId: string,
) {
  if (await isRateLimited(action, userId)) {
    throw new Error(TOO_MANY_REQUESTS);
  }
}
