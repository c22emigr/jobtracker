"use client";

import { startOfWeek, addDays, isoDateOnly } from "@/utils/date";

type Props = {
  selected: string;
  onSelect: (isoDay: string) => void;
  weekStartsOn?: 0 | 1; // 0 Sunday, 1 Monday
  todoCounts: Record<string, { total: number; done: number}>;
}

export default function WeekStrip({
    selected,
    onSelect,
    weekStartsOn = 1, // 1=Mon, 0=Sun
    todoCounts,
}: Props) {
    const start = startOfWeek(new Date(), weekStartsOn);
    const days = Array.from({ length: 7}, (_, i) => addDays(start, i));
    const today = isoDateOnly(new Date());


  return (
    <div className="mt-3 flex gap-2 px-1">
      {days.map((d) => {
        const iso = isoDateOnly(d);
        const isToday = iso === today;
        const isSelected = iso === selected;
        const total = todoCounts[iso]?.total ?? 0;
        const done = todoCounts[iso]?.done ?? 0;

        return (
          <button
            key={iso}
            onClick={() => onSelect(iso)}
            aria-pressed={isSelected}
            title={d.toDateString()}
            className={[
              "h-14 w-14 md:h-16 md:w-16 lg:h-44 lg:w-44",
              "rounded-2xl border grid place-items-center transition",
              "outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]/60",
              isSelected
                ? "bg-[var(--surface)] border-[color:var(--border)] [box-shadow:var(--shadow-sm)]"
                : "border-[color:var(--border)]/70 hover:bg-[color-mix(in_oklab,var(--surface)_92%,var(--foreground)_4%)]",
            ].join(" ")}
          >
            <div className="text-[10px] uppercase tracking-wide opacity-70 leading-none">
              {d.toLocaleDateString(undefined, { weekday: "short" })}
            </div>

            <div className="relative mt-0.5 text-sm md:text-base leading-none">
              {d.getDate()}
              {isToday && (
                <span
                  aria-hidden
                  className="absolute left-1/2 -translate-x-1/2 -bottom-1 h-[2px] w-4 rounded-full
                            bg-[color:var(--accent)]"
                />
              )}
            </div>
            
            {total > 0 && (
              <div className="mt-0.5 text-[10px] rounded px-1 border border-[color:var(--border)]/70">
                {done}/{total}
              </div>
            )}

            {total > 0 && (
              <div className="mt-1 flex gap-0.5 justify-center">
                {Array.from({ length: Math.min(total, 3) }).map((_, i) => (
                  <span
                    key={i}
                    className={[
                      "h-1.5 w-1.5 rounded-full",
                      done ? "bg-[color:var(--success)]" : "bg-[color:var(--muted-foreground)]",
                    ].join(" ")}
                  />
                ))}
                {total > 3 && (
                  <span className="text-[10px] text-[color:var(--muted-foreground)]">+{total - 3}</span>
                )}
              </div>   
            )}         
          </button>
        );
      })}
    </div>
  );
}