type Status = "applied" | "interview" | "rejected";

const map: Record<Status, { bg: string; text: string; label: string }> = {
  applied:   { bg: "bg-emerald-100", text: "text-emerald-700", label: "Applied" },
  interview: { bg: "bg-blue-100",    text: "text-blue-700",    label: "Interview" },
  rejected:  { bg: "bg-red-100",     text: "text-red-700",     label: "Rejected" },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = map[status];
  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs rounded-full border border-[color:var(--border)]
                  ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}