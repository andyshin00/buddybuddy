import { POST_TYPES, type PostType } from "@/lib/constants";

export function PostTypeBadge({ type }: { type: PostType }) {
  const meta = POST_TYPES.find((t) => t.value === type) ?? POST_TYPES[0];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${meta.badgeClass}`}
    >
      {meta.short}
    </span>
  );
}
