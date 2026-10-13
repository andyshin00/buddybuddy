import "server-only";

import { and, count, desc, eq, isNull } from "drizzle-orm";

import type { Viewer } from "@/server/auth";
import { db } from "@/server/db";
import { notification } from "@/server/db/schema";

// For the bell in the header: the viewer's 20 newest notifications and how
// many are unread. Only ever the viewer's own (the WHERE uses viewer.id).
export async function getNotifications(viewer: Viewer) {
  const [items, [unread]] = await Promise.all([
    db
      .select({
        id: notification.id,
        text: notification.text,
        link: notification.link,
        readAt: notification.readAt,
        createdAt: notification.createdAt,
      })
      .from(notification)
      .where(eq(notification.userId, viewer.id))
      .orderBy(desc(notification.createdAt))
      .limit(20),
    db
      .select({ n: count() })
      .from(notification)
      .where(
        and(eq(notification.userId, viewer.id), isNull(notification.readAt)),
      ),
  ]);
  return { items, unread: unread?.n ?? 0 };
}
