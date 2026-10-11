// Postgres error code for "this value already exists" (a unique constraint).
const UNIQUE_VIOLATION = "23505";

// Drizzle wraps the database error, so look at `cause` too.
export function isUniqueViolation(error: unknown): boolean {
  const inner = error instanceof Error && error.cause ? error.cause : error;
  return (
    typeof inner === "object" &&
    inner !== null &&
    "code" in inner &&
    inner.code === UNIQUE_VIOLATION
  );
}
