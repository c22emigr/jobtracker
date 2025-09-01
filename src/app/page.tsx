"use client";
import { useState, useEffect } from "react";
import JobList from "@/components/task/JobList";
import { Job } from "@/lib/types";
import TodoList from "@/components/todo/TodoList";
import { useTodos } from "@/lib/hooks/useTodos";
import { toast } from "sonner";

export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { items: todos, add, toggle, remove } = useTodos();

  // Load jobs from database
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
        <h2 className="px-1 pb-2 text-md font-medium text-[color:var(--muted-foreground)] tracking-wide">Job applications</h2>
        <JobList jobs={jobs} setJobs={setJobs} loading={loading} />
      </div>
      <div>
        <h2 className="px-1 pb-2 text-md font-medium text-[color:var(--muted-foreground)] tracking-wide">Todo list</h2>
        <TodoList items={todos}
                  onAdd={add}
                  onToggle={toggle}
                  onDelete={remove} />
      </div>
    </div>
  );
}
