// utils/updateStatus.ts
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Job } from "@/lib/types";

export async function updateStatus(
  id: string,
  status: Job["status"],
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>
) {
  let snapshot: Job[] = [];
  setJobs(prev => {
    snapshot = [...prev];
    return prev.map(j => (j._id === id ? { ...j, status } : j));
  });

  const res = await api<Job>(`/api/jobs/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    setJobs(snapshot);
    toast.error("Status update failed", { description: res.error });
    return;
  }

  if (res.data) {
    setJobs(prev => prev.map(j => (j._id === id ? res.data! : j)));
  }

  toast.success("Status updated");
}
