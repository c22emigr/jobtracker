"use client";
import { useState, useEffect } from "react";
import NewJobForm from "@/components/task/NewJobForm";
import JobList from "@/components/task/JobList";
import { Job } from "@/lib/types";

export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Load jobs once. New jobs gets fetched
  useEffect(() => {
    async function fetchJobs() {
    const res = await fetch("/api/jobs", { cache: "no-store" });
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  }
    fetchJobs();
  }, []);

  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
      <div>
        <JobList jobs={jobs} setJobs={setJobs} loading={loading} />
      </div>
    </div>
  );
}
