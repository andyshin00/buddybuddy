// Pure business rules for posts (no database, unit-tested).

// Only the person who created a post may edit, close or reopen it.
export function canManagePost(
  viewer: { id: string },
  post: { ownerId: string },
): boolean {
  return post.ownerId === viewer.id;
}
