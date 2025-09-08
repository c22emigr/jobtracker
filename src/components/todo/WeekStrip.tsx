"use client";

import { startOfWeek, addDays, isoDateOnly, sameYMD } from "@/utils/date";

type Item = { dateISO: string | null; done: boolean };

export default function WeekStrip({
    items, 
    selected,
    onSelect,
    weekStartsOn = 1, // 1=Mon, 0=Sun
}: {
    items: Item[];
    selected: string;
    onSelect: (isoDay: string) => void;
    weekStartsOn?: 0 | 1;
}) {
    const start = startOfWeek(new Date(), weekStartsOn);
    const days = Array.from({ length: 7}, (_, i) => addDays(start, i));
    const today = isoDateOnly(new Date());

    const counts = new Map<string, { total: number; done: number }>();
    for (const d of days) counts.set(isoDateOnly(d), { total: 0, done: 0});
    for (const t of items) {
        if (!t.dateISO) continue;
        const key = t.dateISO.slice(0, 10);
        const rec = counts.get(key);
        if (rec) {
            rec.total += 1;
            if (t.done) rec.done += 1;
        }
    }

  return (
    <div className="mt-3 flex gap-2 px-1">
      {days.map((d) => {
        const iso = isoDateOnly(d);
        const isToday = iso === today;
        const isSelected = iso === selected;
        const c = counts.get(iso)!;

        return (
          <button
            key={iso}
            onClick={() => onSelect(iso)}
            aria-pressed={isSelected}
            title={d.toDateString()}
            className={[
              "h-12 w-12 rounded-xl border grid place-items-center transition",
              isSelected
                ? "bg-[var(--surface)] border-[color:var(--border)] [box-shadow:var(--shadow-sm)]"
                : "border-[color:var(--border)]/70 hover:bg-[color-mix(in_oklab,var(--surface)_92%,var(--foreground)_4%)]",
            ].join(" ")}
          >
            <div className="text-[10px] uppercase opacity-70 leading-none">
              {d.toLocaleDateString(undefined, { weekday: "short" })}
            </div>
            <div className={"text-sm leading-none " + (isToday ? "underline underline-offset-4" : "")}>
              {d.getDate()}
            </div>
            {c.total > 0 && (
              <div className="mt-0.5 text-[10px] rounded px-1 border border-[color:var(--border)]/70">
                {c.done}/{c.total}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}