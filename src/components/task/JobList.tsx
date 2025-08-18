"use client";

import { useState, useEffect, useRef } from "react";
import { Job } from "@/lib/types";


export default function JobList({
  jobs,
  setJobs,
  loading,
    }: {
      jobs: Job[];
      setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
      loading: boolean;
    }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLLIElement | null>>([]);
  const listEl = useRef<HTMLUListElement | null>(null); // Focus UL container

  
  useEffect(() => {
    listEl.current?.focus();    // focus the list container
  }, []);


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

async function remove(id: string) {
  const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
  if (res.ok) {
    setJobs(prev => prev.filter(j => j._id !== id));
    setActiveIndex(prev => {
      if (prev === null) return null;
      const newLen = jobs.length - 1;         // length after removal
      return newLen <= 0 ? null : Math.min(prev, newLen - 1);
    });
  } else {
    const err = await res.json().catch(() => ({}));
    alert(`Failed to delete: ${err.error ?? res.statusText}`);
  }
}

  // handle arrow keys + enter
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

  if (loading) return <div>Loading…</div>;
  if (!jobs.length) return <div>No jobs yet.</div>;

  return (
    <ul
      ref={listEl}
      tabIndex={0}                       // container can receive key events
      className="flex flex-col gap-3 outline-none"
      onKeyDown={onListKeyDown}
    >
      {jobs.map((job, index) => (
        <li
          key={job._id}
          ref={(el: HTMLLIElement | null) => { listRef.current[index] = el; }}
          tabIndex={0}
          onClick={() => setActiveIndex(index)} // Mouse click focus
          className={`border rounded p-3 outline-none ${index === activeIndex ? "ring-2 ring-blue-500" : ""}`}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{job.role} · {job.company}</div>
              <div className="text-sm text-gray-600">
                {job.location ?? '—'} • {job.status}
              </div>
              {job.note && <div className="text-sm mt-1">{job.note}</div>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => updateStatus(job._id, 'rejected')} className="px-2 py-1 border rounded">Reject</button>
              <button onClick={() => updateStatus(job._id, 'interview')} className="px-2 py-1 border rounded">Interview</button>
              <button onClick={() => remove(job._id)} className="px-2 py-1 border rounded text-red-600">Delete</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  ); 
}