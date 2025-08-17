"use client";

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
  } else {
    const err = await res.json().catch(() => ({}));
    alert(`Failed to delete: ${err.error ?? res.statusText}`);
  }
}

  if (loading) return <div>Loading…</div>;
  if (!jobs.length) return <div>No jobs yet.</div>;

  return (
    <ul className="flex flex-col gap-3">
      {jobs.map(job => (
        <li key={job._id} className="border rounded p-3">
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