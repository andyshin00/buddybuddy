import "server-only";

import { and, eq, or, type SQL, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

import type { Viewer } from "@/server/auth";
import { db } from "@/server/db";
import { block } from "@/server/db/schema";

import { type BlockState, blockStateFrom } from "./rules";

// How the viewer and one other person stand: who blocked whom.
export async function getBlockState(
  viewer: Viewer,
  otherId: string,
): Promise<BlockState> {
  if (otherId === viewer.id) return { iBlocked: false, blockedMe: false };
  const links = await db
    .select({ blockerId: block.blockerId, blockedId: block.blockedId })
    .from(block)
    .where(
      or(
        and(eq(block.blockerId, viewer.id), eq(block.blockedId, otherId)),
        and(eq(block.blockerId, otherId), eq(block.blockedId, viewer.id)),
      ),
    );
  return blockStateFrom(viewer.id, otherId, links);
}

// A SQL condition for list queries: "no block either way between the
// viewer and the user in `userColumn`". Used by browse to hide posts.
export function notBlockedWith(viewer: Viewer, userColumn: PgColumn): SQL {
  return sql`not exists (
    select 1 from ${block}
    where (${block.blockerId} = ${viewer.id} and ${block.blockedId} = ${userColumn})
       or (${block.blockerId} = ${userColumn} and ${block.blockedId} = ${viewer.id})
  )`;
}
