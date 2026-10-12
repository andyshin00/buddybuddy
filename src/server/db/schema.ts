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
  jsonb,
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

// ---------------------------------------------------------------------------
// Posts (projects looking for collaborators)
// ---------------------------------------------------------------------------

export const postType = pgEnum("post_type", [
  "need-builders",
  "ideate",
  "fill-role",
]);
export const postStatus = pgEnum("post_status", ["open", "closed"]);
export const postDuration = pgEnum("post_duration", [
  "weekend",
  "2-weeks",
  "1-month",
  "3-months",
  "3-plus-months",
]);
export const linkKey = pgEnum("link_key", ["github", "linkedin", "portfolio"]);
export const skillKind = pgEnum("skill_kind", ["required", "nice"]);

export const post = pgTable(
  "post",
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: text()
      .notNull()
      .references(() => profile.userId, { onDelete: "cascade" }),
    title: text().notNull(),
    description: text().notNull(),
    type: postType().notNull(),
    status: postStatus().notNull().default("open"),
    hoursPerWeek: integer().notNull(),
    duration: postDuration().notNull(),
    timezone: text(), // null = no preference
    // Links an applicant must have on their profile (checked in M6).
    requiredLinks: linkKey().array().notNull().default([]),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("post_owner_id_idx").on(t.ownerId),
    // Browsing lists open posts, newest first.
    index("post_status_created_at_idx").on(t.status, t.createdAt),
    check(
      "post_hours_per_week_range",
      sql`${t.hoursPerWeek} between 1 and 168`,
    ),
  ],
);

// The roles a post needs, e.g. "Frontend", "Designer".
export const postRole = pgTable(
  "post_role",
  {
    id: uuid().primaryKey().defaultRandom(),
    postId: uuid()
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    name: text().notNull(),
    filled: boolean().notNull().default(false),
    position: integer().notNull(), // display order
  },
  (t) => [index("post_role_post_id_idx").on(t.postId)],
);

// Many-to-many: the skills a post asks for, required or nice-to-have.
export const postSkill = pgTable(
  "post_skill",
  {
    postId: uuid()
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    skillId: uuid()
      .notNull()
      .references(() => skill.id, { onDelete: "cascade" }),
    kind: skillKind().notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.postId, t.skillId] }),
    index("post_skill_skill_id_idx").on(t.skillId),
  ],
);

// ---------------------------------------------------------------------------
// Application form: the questions a poster asks applicants.
// ---------------------------------------------------------------------------

export const questionType = pgEnum("question_type", [
  "short",
  "long",
  "dropdown",
  "multi",
  "yesno",
]);

export const postQuestion = pgTable(
  "post_question",
  {
    id: uuid().primaryKey().defaultRandom(),
    postId: uuid()
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    position: integer().notNull(), // display order
    type: questionType().notNull(),
    label: text().notNull(),
    required: boolean().notNull().default(false),
    // Choices for "dropdown" and "multi"; an empty list for the other types.
    options: jsonb().$type<string[]>().notNull().default([]),
  },
  (t) => [index("post_question_post_id_idx").on(t.postId)],
);

// ---------------------------------------------------------------------------
// Applications: someone asking to join a post in a role.
// ---------------------------------------------------------------------------

export const applicationStatus = pgEnum("application_status", [
  "pending",
  "accepted",
  "rejected",
]);

// One answer, saved together with the question as it was when the person
// applied. If the poster edits their questions later, old applications still
// read correctly (docs/architecture.md: "Why answers are a jsonb snapshot").
export type AnswerSnapshot = {
  questionId: string;
  label: string;
  type: (typeof questionType.enumValues)[number];
  value: string | string[];
};

export const application = pgTable(
  "application",
  {
    id: uuid().primaryKey().defaultRandom(),
    postId: uuid()
      .notNull()
      .references(() => post.id, { onDelete: "cascade" }),
    applicantId: text()
      .notNull()
      .references(() => profile.userId, { onDelete: "cascade" }),
    // The role applied for. If the poster later removes that role, the link
    // is cleared but `roleName` still says what it was.
    roleId: uuid().references(() => postRole.id, { onDelete: "set null" }),
    roleName: text().notNull(),
    status: applicationStatus().notNull().default("pending"),
    message: text(),
    answers: jsonb().$type<AnswerSnapshot[]>().notNull().default([]),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // One application per person per post.
    uniqueIndex("application_post_applicant_unique").on(
      t.postId,
      t.applicantId,
    ),
    index("application_applicant_id_idx").on(t.applicantId),
  ],
);
