// Drizzle table definitions live here. drizzle-kit reads this file to
// generate migrations: change it, run `npm run db:generate`, review the SQL.
//
// Column names are written in camelCase and stored in snake_case
// (see `casing` in drizzle.config.ts and ./index.ts).

import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const experienceLevel = pgEnum("experience_level", [
  "beginner",
  "intermediate",
  "advanced",
]);

// ---------------------------------------------------------------------------
// Sign-in tables, managed by Better Auth (src/server/auth.ts).
// The table and column names must match what Better Auth expects, so don't
// rename these. See https://www.better-auth.com/docs/concepts/database
// ---------------------------------------------------------------------------

// One row per person. Created on their first sign-in.
export const user = pgTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean().notNull().default(false),
  image: text(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// One row per signed-in browser. The cookie holds `token`.
export const session = pgTable(
  "session",
  {
    id: text().primaryKey(),
    token: text().notNull().unique(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

// One row per sign-in method a user has connected (GitHub, Google).
// Two rows with the same userId = one person who linked both.
export const account = pgTable(
  "account",
  {
    id: text().primaryKey(),
    accountId: text().notNull(), // the user's id at GitHub/Google
    providerId: text().notNull(), // "github" or "google"
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(), // unused: we only allow GitHub/Google sign-in
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

// Short-lived values Better Auth needs during sign-in.
export const verification = pgTable(
  "verification",
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

// Shared tag list used by profiles (and later posts).
export const skill = pgTable(
  "skill",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
  },
  // "React" and "react" are the same skill.
  (t) => [uniqueIndex("skill_name_unique").on(sql`lower(${t.name})`)],
);

// Public profile. One per user, created at onboarding.
export const profile = pgTable(
  "profile",
  {
    // Same id as the `user` row. Deleting the user deletes their profile.
    userId: text()
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    username: text().notNull(),
    displayName: text(),
    headline: text(),
    bio: text(),
    experience: experienceLevel(),
    hoursPerWeek: integer(),
    timezone: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex("profile_username_unique").on(sql`lower(${t.username})`),
    check(
      "profile_hours_per_week_range",
      sql`${t.hoursPerWeek} between 1 and 168`,
    ),
  ],
);

// Private details. Only read through getPrivateProfile(), which decides who
// may see what (docs/privacy.md). Public queries never select from here.
export const profilePrivate = pgTable("profile_private", {
  userId: text()
    .primaryKey()
    .references(() => profile.userId, { onDelete: "cascade" }),
  realName: text(),
  githubUrl: text(),
  linkedinUrl: text(),
  portfolioUrl: text(),
  // The owner can make each link visible to every signed-in user.
  githubPublic: boolean().notNull().default(false),
  linkedinPublic: boolean().notNull().default(false),
  portfolioPublic: boolean().notNull().default(false),
  email: text(),
  discord: text(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// Many-to-many: which skills a profile lists.
export const profileSkill = pgTable(
  "profile_skill",
  {
    userId: text()
      .notNull()
      .references(() => profile.userId, { onDelete: "cascade" }),
    skillId: uuid()
      .notNull()
      .references(() => skill.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.skillId] }),
    // The primary key already covers lookups by userId; this covers "who has skill X?".
    index("profile_skill_skill_id_idx").on(t.skillId),
  ],
);
