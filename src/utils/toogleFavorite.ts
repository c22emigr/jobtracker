"use client";
import type { Job } from "@/lib/types";

export async function toggleFavorite({
    id,
    next,
    setJobs,
}: {
    id: string;
    next: boolean;
    setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
}): Promise<boolean> {
    let rollback: Job[] | null = null;

    // Optimistic update
    setJobs(prev => {
      rollback = prev;
      return prev.map(j => (j._id === id ? { ...j, favorite: next } : j));
  });

  try {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ favorite: next }),
    });

    if (!res.ok) {
      // State is reverted on server error
      if (rollback) setJobs(rollback);
      const err = await res.json().catch(() => ({}));
      console.error("toggleFavorite failed:", err);
      return false;
    }

    return true;
  } catch (e) {
    console.error("toggleFavorite network error:", e);
    if (rollback) setJobs(rollback);
    return false;
  }
}