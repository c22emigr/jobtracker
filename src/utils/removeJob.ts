"use client";

import { toast } from "sonner";
import { apiStrict } from "@/lib/api";
import type { Job } from "@/lib/types";

// Guard to prevent double deletes on same id
const pendingDeletes = new Set<string>(); 

export async function removeJob(
  id: string,
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>
) {
  if (pendingDeletes.has(id)) return;
  pendingDeletes.add(id);

  // Optimistic removal
  let snapshot: Job[] = [];
  setJobs(prev => {
    snapshot = [...prev];
    return prev.filter(j => j._id !== id);
  });

  let cancelled = false;

  const toastId = toast.message("Job removed", {
    description: "Undo?",
    action: {
      label: "Undo",
      onClick: () => {
        cancelled = true;
        clearTimeout(timer);
        setJobs(snapshot);                         // restores
        toast.dismiss(toastId);
        pendingDeletes.delete(id);
      },
    },
    duration: 5000, // match timer below
  })


  const timer = window.setTimeout(async () => {
    try {
      if (cancelled) return;
      // DELETE
      await apiStrict<unknown>(`/api/jobs/${id}`, { method: "DELETE" }, { timeoutMs: 8000 });
      toast.dismiss(toastId);
      toast.success("Job deleted");
    } catch (e: any) {
      // rollback on failure
      setJobs(snapshot);
      toast.dismiss(toastId);
      toast.error(e?.message ?? "Delete failed");
    } finally {
      pendingDeletes.delete(id);
    }
  }, 5000);
}