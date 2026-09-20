const STYLES: Record<string, string> = {
  open: "bg-accent/15 text-accent border-accent/30",
  in_progress: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  closed: "bg-success/15 text-success border-success/30",
};

const LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  closed: "Closed",
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? STYLES.open;
  const label = LABELS[status] ?? status;
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}
