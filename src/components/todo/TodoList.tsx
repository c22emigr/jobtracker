"use client";
import { useState, useMemo } from "react";
import { TodoItem } from "@/lib/types";
import { TodoRow } from "./TodoRow";
import { toast } from "sonner";

export default function TodoList({
  items,
  onAdd,
  onToggle,
  onDelete,
}: {
  items: TodoItem[];
  onAdd: (text: string) => Promise<void> | void;
  onToggle: (id: string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}) {
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState(false);
  const canAdd = draft.trim().length > 0 && !adding; // prevents double submits

  // catch sync & async handler errors with toast 
  const withToast = useMemo(
    () =>
      <T extends any[]>(fn: (...args: T) => void | Promise<void>) =>
      async (...args: T) => {
        try {
          await Promise.resolve(fn(...args));
        } catch (e) {
          console.error(e);
          toast.error(e instanceof Error ? e.message : String(e));
        }
      },
    []
  );

  // Prevent double submit
  const addSafe = withToast(async (text: string) => {
    const value = text.trim();
    if (!value) return; // Dont run if no value
    setAdding(true);
    try {
      await onAdd(text);
      setDraft(""); // clears on success
    } finally {
      setAdding(false);
    }
  });

  const toggleSafe = withToast(onToggle);
  const deleteSafe = withToast(onDelete);

  return (
    <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] [box-shadow:var(--shadow-sm)]">
      {/* Add item */}
      <form className="flex items-center gap-2 px-3 py-2 border-b border-[color:var(--border)]/70"
        onSubmit={(e) => {
          e.preventDefault();
          if (canAdd) addSafe(draft);
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="New reminder…"
          disabled={adding}
          className="flex-1 bg-transparent outline-none px-1 py-1"
          maxLength={140}
          autoComplete="off"
          enterKeyHint="done"
        />
        <button
          type="submit"
          disabled={!canAdd}
          className="text-sm px-2 py-1 rounded-md border border-[color:var(--border)]
                     hover:bg-[color-mix(in_oklab,var(--surface)_90%,var(--foreground)_4%)]
                     disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add"}
        </button>
      </form>

      {/* Items */}
      <ul role="list">
        {items.map((t) => (
          <li
            key={t._id}
            className="border-b border-[color:var(--border)]/60 last:border-b-0"
          >
            <TodoRow item={t} onToggle={toggleSafe} onDelete={deleteSafe} />
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