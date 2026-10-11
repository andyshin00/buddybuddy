// Drizzle table definitions live here. drizzle-kit reads this file to
// generate migrations: change it, run `npm run db:generate`, review the SQL.
//
// Column names are written in camelCase and stored in snake_case
// (see `casing` in drizzle.config.ts and ./index.ts).

import { sql } from "drizzle-orm";
import {
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
    // Better Auth's user id (text). The foreign key to `user` is added in M2,
    // when Better Auth creates that table.
    userId: text().primaryKey(),
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
