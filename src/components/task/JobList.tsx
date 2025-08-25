"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Job, SortKey, SortDir } from "@/lib/types";
import { toggleFavorite } from "@/utils/toogleFavorite";
import EditJobModal from "@/components/ui/EditJobModal";
import { useViewQuery } from "@/lib/hooks/useViewQuery";
import { useDebounceValue } from "@/lib/hooks/useDebounceValue";
import { useKeyboardNav } from "@/lib/hooks/useKeyboardNav";
import { useJobsSort} from "@/lib/hooks/useJobsSort";
import { removeJob } from "@/utils/removeJob";
import { updateStatus } from "@/utils/updateStatus";
import { filterJobs } from "@/utils/filterJobs";


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

  // Status filter
  type StatusFilter = Job["status"] | "all" | "favorite";
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Search state
  const [queryInput, setQueryInput] = useState(""); // for debounce
  const query = useDebounceValue(queryInput, 200);

  // For refocus
  const listRef = useRef<Array<HTMLLIElement | null>>([]);
  const listEl = useRef<HTMLUListElement | null>(null); // Focus UL container

  // Focus UL list container
  useEffect(() => {
    listEl.current?.focus();
  }, []);

  // For saving filter/sort in URL
  useViewQuery({
    sortKey, setSortKey,
    sortDir, setSortDir,
    filter: statusFilter,
    setFilter: v => setStatusFilter(v as StatusFilter),

    q: queryInput, setQ: setQueryInput,          // hook syncs URL from query
    defaults: { sortKey: "createdAt", sortDir: "desc", filter: "all", q: "" },
  });

  // Sorted array of jobs after sorting (hook)
  const sortedJobs = useJobsSort(jobs, sortKey, sortDir);

  // Filter jobs from util
  const filteredJobs = filterJobs(sortedJobs, { q: query, statusFilter });


  // Reset selection after sort changes
  useEffect(() => {
    setActiveIndex(null);
  }, [sortKey, sortDir, query, statusFilter, filteredJobs.length]);

  // Reset list after delete
  useEffect(() => {
    setActiveIndex(i => (i == null ? i : Math.min(i, filteredJobs.length - 1)));
  }, [filteredJobs.length]);

  // keyboard nav
  const onListKeyDown = useKeyboardNav ({
    itemCount: filteredJobs.length,
    getActiveIndex: () => activeIndex,
    setActiveIndex,
    onEnter: (i) => {
      const job = filteredJobs[i];
      if (job) updateStatus(job._id, "interview", setJobs);
    },
  });

  // focus active item when changed
  useEffect(() => {
    if (activeIndex != null) {
      listRef.current[activeIndex]?.focus({ preventScroll: true });
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
        onChange={e => setStatusFilter(e.target.value as StatusFilter)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="all">All</option>
        <option value="applied">Applied</option>
        <option value="interview">Interview</option>
        <option value="rejected">Rejected</option>
        <option value="favorite">Favorite</option>
      </select>
      <span className="text-sm text-gray-600 ml-2">
        {filteredJobs.length} job{filteredJobs.length !== 1 && "s"}
      </span>
      <input
        value={queryInput}
        onChange={e => setQueryInput(e.target.value)}
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
                onClick={() => updateStatus(job._id, "applied", setJobs)}
                className="px-2 py-1 border rounded"
              >
                Applied
              </button>
              <button
                onClick={() => updateStatus(job._id, "rejected", setJobs)}
                className="px-2 py-1 border rounded"
              >
                Reject
              </button>
              <button
                onClick={() => updateStatus(job._id, "interview", setJobs)}
                className="px-2 py-1 border rounded"
              >
                Interview
              </button>
              <button
                onClick={() => removeJob(job._id, setJobs)}
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