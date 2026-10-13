// Pure rules for deleting an account (no database, unit-tested).

// What the user must type to confirm: their username, or "delete" if they
// never picked one.
export function confirmationWord(viewer: { username: string | null }): string {
  return viewer.username ?? "delete";
}

// Capitals and spaces around it don't matter; anything else does.
export function isConfirmed(
  typed: string,
  viewer: { username: string | null },
): boolean {
  return typed.trim().toLowerCase() === confirmationWord(viewer).toLowerCase();
}
