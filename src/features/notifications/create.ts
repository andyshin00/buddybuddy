import "server-only";

import type { db } from "@/server/db";
import { notification } from "@/server/db/schema";

import type { Notice } from "./rules";

// The `tx` you get inside db.transaction(async (tx) => ...).
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// Save a notification for `userId`. Called by other features' Server
// Actions, INSIDE their transaction, so the notification is saved together
// with the change it describes (or not at all).
//
// This file is deliberately not "use server": every function exported from
// a "use server" file can be called from the browser, and nobody should be
// able to send notifications to anyone they like.
export async function notify(tx: Tx, userId: string, notice: Notice) {
  await tx.insert(notification).values({ userId, ...notice });
}
