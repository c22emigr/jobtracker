"use client";
import { useState, useEffect, useMemo } from "react";
import JobList from "@/components/task/JobList";
import { Job } from "@/lib/types";
import TodoList from "@/components/todo/TodoList";
import { useTodos } from "@/lib/hooks/useTodos";
import WeekStrip from "@/components/todo/WeekStrip";
import { isoDateOnly, sameYMD } from "@/utils/date";
import { apiStrict } from "@/lib/api";
import { buildTodoCounts } from "@/utils/todoCounts";

export default function Page() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { items: todos, add, toggle, remove } = useTodos();
  const [selectedDay, setSelectedDay] =  useState(() => isoDateOnly(new Date ()));
  const todoCounts = useMemo(() => buildTodoCounts(todos), [todos]);

    const dayTodos = useMemo(
    () => todos.filter(t => t.dateISO && sameYMD(t.dateISO, selectedDay)),
    [todos, selectedDay]
  );

  // Load jobs from database
useEffect(() => {
  (async () => {
    try {
      const jobs = await apiStrict<Job[]>("/api/jobs");
      setJobs(jobs);
    } catch {
      // optional: could set an error state, or just leave jobs empty
      setJobs([]);
    } finally {
      setLoading(false);
    }
  })();
}, []);
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
      <div>
        <h2 className="px-1 pb-2 text-md font-medium text-[color:var(--muted-foreground)] tracking-wide">Job applications</h2>
        <JobList 
          jobs={jobs} 
          setJobs={setJobs} 
          loading={loading} />
      </div>
      <div>
        <h2 className="px-1 pb-2 text-md font-medium text-[color:var(--muted-foreground)] tracking-wide">Todo list</h2>
        <TodoList
          items={dayTodos}
          onAdd={(text) => add(text, { dateISO: selectedDay })}
          onToggle={toggle}
          onDelete={remove} />

        <WeekStrip 
          selected={selectedDay}
          onSelect={setSelectedDay}
          todoCounts={todoCounts}
        />
      </div>
    </div>
  );
}
