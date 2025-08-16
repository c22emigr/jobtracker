"use client";
import { useEffect, useState } from "react";

type Job = {
  _id: string;
  role: string;
  company: string;
  location?: string;
  note?: string;
  status: 'applied'|'interview'|'rejected';
  createdAt: string;
  updatedAt: string;
};

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/jobs');
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: Job['status']) {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) load(); else alert('Failed to update');
  }

  async function remove(id: string) {
    if (!confirm('Delete this item?')) return;
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    if (res.ok) setJobs(jobs => jobs.filter(j => j._id !== id));
    else alert('Failed to delete');
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