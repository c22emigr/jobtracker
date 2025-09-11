import type { TodoItem } from "@/lib/types";

// String conversion for date comparison to check if before
const isBeforeISO = (a: string, b: string) => a < b;

// Visible todos for a given day
// Ignore undated todos
// Unfinished todos from today
// Todos scheduled for that day

export function getVisibleTodos(
    todos: TodoItem[],
    selectedDay: string,
): TodoItem [] {
    return todos.filter((t) => {
        if (!t.dateISO) return false; // Skip undated todos
        if (t.dateISO.slice(0, 10) === selectedDay) return true; // Scheduled for today
        if (!t.done && isBeforeISO(t.dateISO.slice(0, 10), selectedDay)) return true; // If overdue, i.e. earlier
        return false;
    });

}

// Count how many todos are overdue
export function countOverdueForDay(
    todos: TodoItem[],
    selectedDay: string
): number {
    return todos.reduce((n, t) =>
    (!t.done && t.dateISO && isBeforeISO(t.dateISO.slice(0, 10), selectedDay)) ? n + 1 : n, 0); // For the counter
}