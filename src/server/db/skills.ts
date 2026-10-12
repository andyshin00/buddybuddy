import { inArray, sql } from "drizzle-orm";

import type { db } from "./index";
import { skill } from "./schema";

// A database client or an open transaction: both have the same methods.
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Makes sure every skill name exists in the `skill` table and returns
// lowercased name → id. Names match ignoring capitals: "react" reuses an
// existing "React" instead of creating a second one.
export async function findOrCreateSkills(
  tx: Tx,
  names: string[],
): Promise<Map<string, string>> {
  if (names.length === 0) return new Map();

  // Add the new ones; existing names hit the unique index and are skipped.
  await tx
    .insert(skill)
    .values(names.map((name) => ({ name })))
    .onConflictDoNothing();

  const rows = await tx
    .select({ id: skill.id, name: skill.name })
    .from(skill)
    .where(
      inArray(
        sql`lower(${skill.name})`,
        names.map((name) => name.toLowerCase()),
      ),
    );
  return new Map(rows.map((row) => [row.name.toLowerCase(), row.id]));
}
