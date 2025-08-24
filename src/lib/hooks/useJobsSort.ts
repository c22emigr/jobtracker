"use client";
import { useMemo } from "react";
import type { Job } from "../types";

const STATUS_ORDER: Record<Job["status"], number> = {
    applied: 0, interview: 1, rejected: 2,
};

export function useJobsSort(jobs: Job[], sortKey: "status"|"company"|"createdAt"|"favorite", sortDir: "asc"|"desc") {
    return useMemo(() => {
    const base = jobs.slice(); // no onlyFav here
    base.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "favorite") {
        cmp = (a.favorite ? 1 : 0) - (b.favorite ? 1 : 0);
      } else if (sortKey === "status") {
        cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      } else if (sortKey === "company") {
        cmp = a.company.localeCompare(b.company, undefined, { sensitivity: "base" });
      } else {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (cmp === 0) {
        const t1 = a.company.localeCompare(b.company, undefined, { sensitivity: "base" });
        cmp = t1 || a._id.localeCompare(b._id);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return base;
  }, [jobs, sortKey, sortDir]);
}