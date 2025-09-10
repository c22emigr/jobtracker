import type { TodoItem } from "@/lib/types";
import { isoDateOnly } from "@/utils/date";

// Number of daily todos which is displayed in calendar
export function buildTodoCounts(todos: TodoItem[]) {
  const counts: Record<string, { total: number; done: number }> = {};

  for (const t of todos) {
    if (!t.dateISO) continue; // skip todos without a day
    const day = isoDateOnly(new Date(t.dateISO));

    if (!counts[day]) counts[day] = { total: 0, done: 0 };
    counts[day].total++;
    if (t.done) counts[day].done++;
  }

  return counts;
}
