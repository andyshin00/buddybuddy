"use server";

import { and, eq, isNull } from "drizzle-orm";

import { requireProfile } from "@/server/auth";
import { db } from "@/server/db";
import { notification } from "@/server/db/schema";

// Called when the bell's dropdown opens. It takes no arguments, so there's
// nothing to tamper with: it can only ever mark YOUR notifications read.
export async function markAllRead() {
  const viewer = await requireProfile();
  await db
    .update(notification)
    .set({ readAt: new Date() })
    .where(
      and(eq(notification.userId, viewer.id), isNull(notification.readAt)),
    );
}
