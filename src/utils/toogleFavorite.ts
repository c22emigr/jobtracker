"use client";
import type { Job } from "@/lib/types";
import { toast } from "sonner";
import { apiStrict } from "@/lib/api";

const pendingFavorite = new Set<string>();

export async function toggleFavorite({
    id,
    next,
    setJobs,
}: {
    id: string;
    next: boolean;
    setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
}): Promise<boolean> {
  if (pendingFavorite.has(id)) return false;
  pendingFavorite.add(id);

    // Snapshot for rollback
    let rollback: Job[] = [];
    setJobs(prev => {
      rollback = [...prev];
      return prev.map(j => (j._id === id ? { ...j, favorite: next } : j));
  });

  // Call via helper
  try {
    // strict throws on API error; body is auto-JSON
    const updated = await apiStrict<Job>(`/api/jobs/${id}`, {
      method: "PATCH",
      body: { favorite: next },
    });

    // replace optimistic with server version
    setJobs(list => list.map(j => (j._id === id ? updated : j)));

    toast.success(next ? "Added to favorites" : "Removed from favorites");
    return true;
  } catch (e: any) {
    // rollback
    setJobs(rollback);
    toast.error("Could not update favorite", { description: e.message });
    return false;
  } finally {
    pendingFavorite.delete(id);
  }
}