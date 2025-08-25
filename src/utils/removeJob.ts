"use client";

import { toast } from "sonner";
import { api } from "@/lib/api";
import type { Job } from "@/lib/types";

export async function removeJob(
  id: string,
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>
) {
  let snapshot: Job[] = [];
  setJobs(prev => {
    snapshot = [...prev];
    return prev.filter(j => j._id !== id);
  });

  let cancelled = false;
  const undo = () => {
    cancelled = true;
    setJobs(snapshot);
  };

  const t = setTimeout(async () => {
    if (cancelled) return;
    const res = await api<{ ok: true }>(`/api/jobs/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setJobs(snapshot);
      toast.error("Delete failed", { description: res.error });
    } else {
      toast.success("Job deleted");
    }
  }, 5000);

  toast.message("Job removed", {
    description: "Undo?",
    action: {
      label: "Undo",
      onClick: () => {
        clearTimeout(t);
        undo();
      },
    },
  });
}