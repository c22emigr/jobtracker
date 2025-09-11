// utils/updateStatus.ts
import { apiStrict } from "@/lib/api";
import { toast } from "sonner";
import { Job } from "@/lib/types";

// Prevents double updates on same job guard
const pending = new Set<string>();

export async function updateStatus(
  id: string,
  status: Job["status"],
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>
) {
  if (pending.has(id)) return;
  pending.add(id);

  // Optimistic update
  let snapshot: Job[] = [];
  setJobs(prev => {
    snapshot = [...prev];
    return prev.map(j => (j._id === id ? { ...j, status } : j));
  });

  try {
    // strict throws on API error; body is auto-JSON
    const updated = await apiStrict<any>(`/api/jobs/${id}`, {
      method: "PATCH",
      body: { status },
    }, { timeoutMs: 6000 });

    // if server returns the updated job, reconcile (else keep optimistic)
    if (updated && typeof updated === "object") {
      setJobs(prev => prev.map(j => (j._id === id ? (updated as Job) : j)));
    }

    toast.success("Status updated");
  } catch (e: any) {
    // rollback on failure
    setJobs(snapshot);
    toast.error(e?.message ?? "Status update failed");
  } finally {
    pending.delete(id);
  }
}
