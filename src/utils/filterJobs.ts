import type { Job } from "@/lib/types";

export type StatusFilter = Job["status"] | "all" | "favorite";

export function filterJobs(
  jobs: Job[],
  opts: { q: string; statusFilter: StatusFilter }
): Job[] {
  const q = opts.q.trim().toLowerCase();

  return jobs.filter(j => {
    // status / favorite filter
    if (opts.statusFilter === "favorite" && !j.favorite) return false;
    if (
      opts.statusFilter !== "all" &&
      opts.statusFilter !== "favorite" &&
      j.status !== opts.statusFilter
    ) return false;

    // text search
    if (!q) return true;
    return (
      j.company.toLowerCase().includes(q) ||
      j.role.toLowerCase().includes(q) ||
      (j.location ?? "").toLowerCase().includes(q)
    );
  });
}
