import { Status } from "@/lib/genlayer";

const MAP: Record<number, { label: string; cls: string; dot: string }> = {
  [Status.REJECTED]: {
    label: "Rejected",
    cls: "border-red-500/30 bg-red-500/5 text-red-300",
    dot: "bg-red-400",
  },
  [Status.SERVED]: {
    label: "Pending",
    cls: "border-amber-500/30 bg-amber-500/5 text-amber-300",
    dot: "bg-amber-400",
  },
  [Status.RESPONDED]: {
    label: "Under Review",
    cls: "border-sky-500/30 bg-sky-500/5 text-sky-300",
    dot: "bg-sky-400",
  },
  [Status.RESOLVED]: {
    label: "Resolved",
    cls: "border-accent/40 bg-accent-soft text-accent",
    dot: "bg-accent",
  },
};

export function StatusBadge({
  status,
  size = "sm",
}: {
  status: number;
  size?: "sm" | "md";
}) {
  const s = MAP[status] ?? {
    label: "Unknown",
    cls: "border-border bg-surface-2 text-muted",
    dot: "bg-faint",
  };
  const pad = size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[11px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border font-mono uppercase tracking-wider ${pad} ${s.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
