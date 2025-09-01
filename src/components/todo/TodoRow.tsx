"use client";
import { TodoItem } from "@/lib/types";

export function TodoRow({
  item,
  onToggle,
  onDelete,
}: {
  item: TodoItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const due =
    item.dateISO ? new Date(item.dateISO).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }) : null;

  return (
    <div className="group flex items-center gap-3 px-3 py-2">
      <button
        onClick={() => onToggle(item._id!)}   // assumes _id is set
        aria-pressed={item.done}
        className={`grid place-items-center shrink-0 w-5 h-5 rounded-full border
                    border-[color:var(--border)]
                    ${item.done ? "bg-[var(--accent)] border-[var(--accent)]" : "bg-[var(--surface)]"}`}
      >
        {item.done && (
          <svg viewBox="0 0 20 20" className="w-3 h-3 fill-white">
            <path d="M7.7 13.3 4.9 10.5l-1.4 1.4L7.7 16l8.8-8.8-1.4-1.4z" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className={item.done ? "truncate line-through opacity-60" : "truncate"}>
          {item.text}
        </div>
        {due && <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{due}</div>}
      </div>

      <button
        onClick={() => onDelete(item._id!)}
        className="opacity-0 group-hover:opacity-100 transition text-red-600 text-sm px-2 py-1 rounded-md hover:bg-red-50"
      >
        Delete
      </button>
    </div>
  );
}