"use client";
import { useEffect, useState, useRef } from "react";
import type { TodoItem } from "@/lib/types";
import { toast } from "sonner";

const now = () => new Date().toISOString();

export function useTodos() {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const pendingTimers = useRef(new Map<string, number>());

  type AddOpts = { dateISO?: string | null};

  // initial load
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
      const r = await fetch("/api/todos", { cache: "no-store" });
      const j = await r.json().catch(() => null);
      if (!cancelled && j?.ok) setItems(j.data);
    } catch (e) {
      if (!cancelled) toast.error("Failed to load todos");
      console.error(e);
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();

  // cancel pending timers on unmount
  return () => {
    cancelled = true;
    for (const [, t] of pendingTimers.current) clearTimeout(t);
    pendingTimers.current.clear();
    };
  }, []);

  async function add(text: string, opts?: AddOpts): Promise<void> {
    const optimistic: TodoItem = {
      _id: `tmp-${crypto.randomUUID()}`,
      text,
      done: false,
      dateISO: opts?.dateISO ?? null,
      createdAt: now(),
      updatedAt: now(),
    };

    setItems(p => [optimistic, ...p]);

    try {
      const r = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, dateISO: opts?.dateISO ?? null }),
      });

      const raw = await r.text();
      const j = raw ? (JSON.parse(raw) as any) : null;
      if (!r.ok || !j?.ok) {
        // rollback
        setItems(p => p.filter(t => t._id !== optimistic._id));
        throw new Error(j?.error || "Failed to add");
      }

      // replace optimistic with actual
      setItems(p => p.map(t => (t._id === optimistic._id ? j.data : t)));
    } catch (e) {
      setItems(p => p.filter(t => t._id !== optimistic._id));
      throw e;
    }
  }

  async function toggle(id: string): Promise<void> {
    const cur = items.find(t => t._id === id);
    if (!cur) return;
    setItems(p => p.map(t => t._id === id ? ({ ...t, done: !t.done }) : t));
    try {
      await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !cur.done }),
      });
    } catch (e) {
      // rollback on network error
      setItems(p => p.map(t => (t._id === id ? { ...t, done: cur.done } : t)));
      throw e instanceof Error ? e : new Error("Failed to update");
    }
  }


  function remove(id: string): Promise<void> {
    // find and optimistically remove
    const idx = items.findIndex(t => t._id === id);
    if (idx === -1) return Promise.resolve();
    const removed = items[idx];

    setItems(prev => {
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });

    // show undo toast
    const toastId = toast("Todo deleted", {
      description: removed.text,
      action: {
        label: "Undo",
        onClick: () => {
          // cancel the server delete
          const timer = pendingTimers.current.get(id);
          if (timer) {
            clearTimeout(timer);
            pendingTimers.current.delete(id);
          }
          // restore at original index
          setItems(prev => {
            const copy = [...prev];
            copy.splice(Math.min(idx, copy.length), 0, removed);
            return copy;
          });
          toast.dismiss(toastId);
        },
      },
      duration: 4000, // window to undo
    });

    // after window, actually delete on server (unless undone)
    return new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(async () => {
        pendingTimers.current.delete(id);
        try {
          const r = await fetch(`/api/todos/${id}`, { method: "DELETE" });
          if (!r.ok) {
            // server failed → restore item
            setItems(prev => {
              const copy = [...prev];
              copy.splice(Math.min(idx, copy.length), 0, removed);
              return copy;
            });
            toast.error("Failed to delete");
            reject(new Error("Failed to delete"));
            return;
          }
          resolve();
        } catch (e) {
          // network error → restore item
          setItems(prev => {
            const copy = [...prev];
            copy.splice(Math.min(idx, copy.length), 0, removed);
            return copy;
          });
          toast.error("Network error");
          reject(e as Error);
        }
      }, 4000);

      pendingTimers.current.set(id, timer);
    });
  }

  return { items, loading, add, toggle, remove };
}