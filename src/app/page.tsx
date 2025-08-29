"use client";
import { useState, useEffect } from "react";
import JobList from "@/components/task/JobList";
import { Job, TodoItem } from "@/lib/types";
import TodoList from "@/components/todo/TodoList";

export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [todos, setTodos] = useState<TodoItem[]>([]);

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
      <div>
        <TodoList
          items={todos}
          onAdd={(text) =>
            setTodos(prev => [
              {
                _id: crypto.randomUUID(),
                text,
                done: false,
                dateISO: null,                       // or a date string if you want
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              ...prev,
            ])
          }
          onToggle={(id) =>
            setTodos(prev =>
              prev.map(t =>
                t._id === id
                  ? { ...t, done: !t.done, updatedAt: new Date().toISOString() }
                  : t
              )
            )
          }
          onDelete={(id) =>
            setTodos(prev => prev.filter(t => t._id !== id))
          }
        />
      </div>
    </div>
  );
}
