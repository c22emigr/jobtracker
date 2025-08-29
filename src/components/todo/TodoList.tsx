"use client";
import { useState } from "react";
import { TodoRow } from "./TodoRow";

type Todo = { _id: string; text: string; done: boolean; dateISO?: string | null };

export default function TodoList({
  items,
  onAdd,
  onToggle,
  onDelete,
}: {
  items: TodoItem[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const canAdd = draft.trim().length > 0;

  return (
    <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] [box-shadow:var(--shadow-sm)]">
      {/* Quick add */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[color:var(--border)]/70">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && canAdd) {
              onAdd(draft.trim());
              setDraft("");
            }
          }}
          placeholder="New reminder…"
          className="flex-1 bg-transparent outline-none px-1 py-1"
          aria-label="Add new reminder"
        />
        <button
          onClick={() => {
            if (!canAdd) return;
            onAdd(draft.trim());
            setDraft("");
          }}
          disabled={!canAdd}
          className="text-sm px-2 py-1 rounded-md border border-[color:var(--border)]
                     hover:bg-[color-mix(in_oklab,var(--surface)_90%,var(--foreground)_4%)]
                     disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* Items */}
      <ul role="list">
        {items.map((t) => (
          <li
            key={t._id}
            className="border-b border-[color:var(--border)]/60 last:border-b-0"
          >
            {/* TodoRow should render a row container (div), not an <li> */}
            <TodoRow item={t} onToggle={onToggle} onDelete={onDelete} />
          </li>
        ))}

        {items.length === 0 && (
          <li className="px-3 py-4 text-sm text-[var(--muted-foreground)]">
            No reminders
          </li>
        )}
      </ul>
    </section>
  );
}