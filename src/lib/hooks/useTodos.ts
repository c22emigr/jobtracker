"use client";
import { useEffect, useState } from "react";
import type { TodoItem } from "@/lib/types";

const now = () => new Date().toISOString();

export function useTodos() {
  const [items, setItems] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);

  // initial load
  useEffect(() => {
    (async () => {
      const r = await fetch("/api/todos", { cache: "no-store" });
      const j = await r.json().catch(() => null);
      if (j?.ok) setItems(j.data);
      setLoading(false);
    })();
  }, []);

  async function add(text: string) {
    const optimistic: TodoItem = {
      _id: `tmp-${crypto.randomUUID()}`,
      text, done: false, dateISO: null,
      createdAt: now(), updatedAt: now(),
    };
    setItems(p => [optimistic, ...p]);
    try {
      const r = await fetch("/api/todos", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const j = await r.json();
      if (!r.ok || !j?.ok) throw new Error(j?.error || r.statusText);
      setItems(p => p.map(t => t._id === optimistic._id ? j.data : t));
    } catch (e) {
      setItems(p => p.filter(t => t._id !== optimistic._id)); // rollback
      throw e;
    }
  }

  async function toggle(id: string) {
    const cur = items.find(t => t._id === id);
    if (!cur) return;
    setItems(p => p.map(t => t._id === id ? ({ ...t, done: !t.done }) : t));
    try {
      await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !cur.done }),
      });
    } catch {
      setItems(p => p.map(t => t._id === id ? ({ ...t, done: cur.done }) : t)); // rollback
      throw new Error("toggle failed");
    }
  }

  async function remove(id: string) {
    const prev = items;
    setItems(prev.filter(t => t._id !== id));
    try {
      const r = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
    } catch {
      setItems(prev); // rollback
      throw new Error("delete failed");
    }
  }

  return { items, loading, add, toggle, remove };
}