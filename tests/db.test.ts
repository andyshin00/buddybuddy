import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { db } from "@/db";
import { user } from "@/db/schema";

const id = "test-user-smoke";

async function cleanup() {
  await db.delete(user).where(eq(user.id, id));
}

describe("test database", () => {
  beforeAll(cleanup); // in case a crashed run left a row behind
  afterAll(cleanup);

  it("can insert and read a user", async () => {
    await db
      .insert(user)
      .values({ id, name: "Test", email: "smoke@example.com" });

    const rows = await db.select().from(user).where(eq(user.id, id));

    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe("smoke@example.com");
  });
});
