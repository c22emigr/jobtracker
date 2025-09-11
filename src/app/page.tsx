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
import { getVisibleTodos, countOverdueForDay } from "@/utils/visibleTodos";

export default function Page() {
  // Jobs
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Todos
  const { items: todos, add, toggle, remove } = useTodos();
  const [selectedDay, setSelectedDay] =  useState(() => isoDateOnly(new Date ()));

  // Counts for WeekStrip but ignores undated
  const todoCounts = useMemo(() => buildTodoCounts(todos), [todos]);

  // Dated + overdue todos for selected day
  const dayTodos = useMemo(
    () => getVisibleTodos(todos, selectedDay),
    [todos, selectedDay]
  );

  // Undated todos
  const undatedTodos = useMemo(
    () => todos.filter(t => !t.dateISO),
    [todos]
  );

  // Single list for all todos in UI (undated & dated)
  const listItems = useMemo(
    () => [...dayTodos, ...undatedTodos],
    [dayTodos, undatedTodos]
  );

  // Overdue todos badge
  const overdueCount = useMemo(
    () => countOverdueForDay(todos, selectedDay),
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
        <h2 className="px-1 pb-2 text-md font-medium text-[color:var(--muted-foreground)] tracking-wide">
          Todo list
          {overdueCount > 0 && (
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full border border-[color:var(--border)]/70 text-[color:var(--muted-foreground)]">
              +{overdueCount} overdue
            </span>
          )}
        </h2>
        <TodoList
          items={listItems}
          onAddDated={(text) => add(text, { dateISO: selectedDay })}
          onAddUndated={(text) => add(text, { dateISO: null })}
          onToggle={toggle}
          onDelete={remove} 
          defaultAddMode="dated"
        />

        <WeekStrip 
          selected={selectedDay}
          onSelect={setSelectedDay}
          todoCounts={todoCounts}
        />
      </div>
    </div>
  );
}
