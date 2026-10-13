const STYLES = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  accepted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-zinc-100 text-zinc-600 ring-zinc-200",
} as const;

const LABELS = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Not selected",
};

export function StatusBadge({ status }: { status: keyof typeof STYLES }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
