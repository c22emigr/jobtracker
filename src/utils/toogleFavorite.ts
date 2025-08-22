"use client";
import type { Job } from "@/lib/types";
import { toast } from "sonner";
import { api } from "@/lib/api";

export async function toggleFavorite({
    id,
    next,
    setJobs,
}: {
    id: string;
    next: boolean;
    setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
}): Promise<boolean> {
    // Snapshot for rollback
    let rollback: Job[] = [];
    setJobs(prev => {
      rollback = [...prev];
      return prev.map(j => (j._id === id ? { ...j, favorite: next } : j));
  });

  // Call via helper
  const res = await api<Job>(`/api/jobs/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ favorite: next }),
  });

  if (!res.ok) {
    setJobs(rollback);
    toast.error("Could not update favorite", { description: res.error });
    return false;
  }

  // replace optimistic with server version
  if (res.data) {
    setJobs(list => list.map(j => (j._id === id ? res.data! : j)));
  }

  toast.success(next ? "Added to favorites" : "Removed from favorites");
  return true;
}