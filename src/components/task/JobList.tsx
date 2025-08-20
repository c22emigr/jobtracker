"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Job } from "@/lib/types";
import { toggleFavorite } from "@/utils/toogleFavorite";
import EditJobModal from "@/components/ui/EditJobModal";

type SortKey = "status" | "company" | "createdAt" | "favorite";
type SortDir = "asc" | "desc";

const STATUS_ORDER: Record<Job["status"], number> = { // Define order for status
  applied: 0,
  interview: 1,
  rejected: 2,
};

export default function JobList({
  jobs,
  setJobs,
  loading,
    }: {
      jobs: Job[];
      setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
      loading: boolean;
    }) {

  // editJobModal:
  const [editOpen, setEditOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  function openEdit(job: Job) {
    setEditingJob(job);
    setEditOpen(true);
  }
  function closeEdit() {
    setEditOpen(false);
    setEditingJob(null);
  }

  // Keyboard nav state
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Sorting state
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [onlyFav, setOnlyFav] = useState(false);

  // Status filter
  const [statusFilter, setStatusFilter] = useState<Job["status"] | "all">("all");

  // Search state
  const [query, setQuery] = useState("");

  // For refocus
  const listRef = useRef<Array<HTMLLIElement | null>>([]);
  const listEl = useRef<HTMLUListElement | null>(null); // Focus UL container

  // Focus UL list container
  useEffect(() => {
    listEl.current?.focus();
  }, []);


  // Sorted array of jobs after sorting
  const sortedJobs = useMemo(() => {
    // filter first (if needed), then copy to sort
    const base = onlyFav ? jobs.filter(j => j.favorite) : jobs.slice();

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
        // tie-breaker to sort between favorites
        const t1 = a.company.localeCompare(b.company, undefined, { sensitivity: "base" });
        if (t1) cmp = t1;
        else cmp = a._id.localeCompare(b._id);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return base;
}, [jobs, sortKey, sortDir, onlyFav]);

  // Search company, role, location
const filteredJobs = useMemo(() => {
  const q = query.trim().toLowerCase();

  return sortedJobs.filter(j => {
    // status filter
    if (statusFilter !== "all" && j.status !== statusFilter) return false;

    // search filter
    if (q) {
      return (
        j.company.toLowerCase().includes(q) ||
        j.role.toLowerCase().includes(q) ||
        (j.location ?? "").toLowerCase().includes(q)
      );
    }

    return true;
  });
}, [sortedJobs, query, statusFilter]);

  // Reset selection after sort changes
  useEffect(() => {
    setActiveIndex(null);
  }, [sortKey, sortDir, jobs.length]);

  // Updates backend
  async function updateStatus(id: string, status: Job["status"]) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setJobs(prev =>
        prev.map(j => (j._id === id ? { ...j, status } : j))
      );
    } else alert("Failed to update");
  }

  // Updates backend
  async function remove(id: string) {
    const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    if (res.ok) {
      setJobs(prev => prev.filter(j => j._id !== id));
      setActiveIndex(prev => {
        if (prev === null) return null;
        const newLen = filteredJobs.length - 1;         // length after removal
        return newLen <= 0 ? null : Math.min(prev, newLen - 1);
      });
    } else {
      const err = await res.json().catch(() => ({}));
      alert(`Failed to delete: ${err.error ?? res.statusText}`);
    }
}

  // keyboard nav
  function onListKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    if (!jobs.length) return;
    const tag = (e.target as HTMLElement).tagName.toUpperCase();
    if (["BUTTON", "INPUT", "TEXTAREA", "SELECT", "A"].includes(tag)) return;

    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex(p => p === null ? 0 : Math.min(p + 1, jobs.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex(p => p === null ? jobs.length - 1 : Math.max(p - 1, 0)); }
    else if (e.key === "Enter" && activeIndex !== null) {
      e.preventDefault();
      const job = jobs[activeIndex];
      if (job) updateStatus(job._id, "interview");
    }
  }

  // focus active item when changed
  useEffect(() => {
    if (activeIndex !== null && listRef.current[activeIndex]) {
      listRef.current[activeIndex]?.focus();
    }
  }, [activeIndex]);

  // Render
  if (loading) return <div>Loading…</div>;
  if (!jobs.length) return <div>No jobs yet.</div>;


return (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <label className="text-sm text-gray-500">Sort by</label>
      <select
        value={sortKey}
        onChange={e => setSortKey(e.target.value as SortKey)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="createdAt">Created</option>
        <option value="status">Status</option>
        <option value="company">Company</option>
        <option value="favorite">Favorite</option>
      </select>
      <button
        onClick={() => setSortDir(d => (d === "asc" ? "desc" : "asc"))}
        className="border rounded px-2 py-1 text-sm"
      >
        {sortDir === "asc" ? "Asc ↑" : "Desc ↓"}
      </button>
      <select
        value={statusFilter}
        onChange={e => setStatusFilter(e.target.value as any)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="all">All</option>
        <option value="applied">Applied</option>
        <option value="interview">Interview</option>
        <option value="rejected">Rejected</option>
      </select>
      <span className="text-sm text-gray-600 ml-2">
        {filteredJobs.length} job{filteredJobs.length !== 1 && "s"}
      </span>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Filter by company/role…"
        className="border rounded px-2 py-1 text-sm ml-auto"
      />
    </div>

    <ul
      ref={listEl}
      tabIndex={0} // Keyboard events for ul
      className="flex flex-col gap-3 outline-none"
      onKeyDown={onListKeyDown}
    >
      {filteredJobs.map((job, index) => (
        <li
          key={job._id}
          ref={(el: HTMLLIElement | null) => {
            listRef.current[index] = el;
          }}
          tabIndex={0}
          onClick={() => setActiveIndex(index)} // Mouse click to focus li 
          className={`border rounded p-3 outline-none ${
            index === activeIndex ? "ring-2 ring-blue-500" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">
                {job.role} · {job.company}
              </div>
              <div className="text-sm text-gray-600">
                {job.location ?? "—"} • {job.status}
              </div>
              {job.note && <div className="text-sm mt-1">{job.note}</div>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateStatus(job._id, "rejected")}
                className="px-2 py-1 border rounded"
              >
                Reject
              </button>
              <button
                onClick={() => updateStatus(job._id, "interview")}
                className="px-2 py-1 border rounded"
              >
                Interview
              </button>
              <button
                onClick={() => remove(job._id)}
                className="px-2 py-1 border rounded text-red-600"
              >
                Delete
              </button>
              <button
                onClick={() => toggleFavorite({ id: job._id, next: !job.favorite, setJobs })}
                className={`px-2 py-1 border rounded ${job.favorite ? "bg-yellow-400" : ""}`}
                title="Toggle favorite"
              >
                {job.favorite ? "★" : "☆"}
              </button>
              <button
                onClick={() => openEdit(job)}
                className="px-2 py-1 border rounded text-blue-600"
              >
                Edit
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>

        {/* Edit Modal */}
    {editingJob && (
      <EditJobModal
        open={editOpen}
        onClose={closeEdit}
        job={editingJob}
        setJobs={setJobs}
      />
    )}

  </div>
);
}