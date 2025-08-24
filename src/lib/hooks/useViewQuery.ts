"use  client";
import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type UseViewQueryOpts = {
  sortKey: string; setSortKey: (v: any) => void;
  sortDir: string; setSortDir: (v: any) => void;
  filter: string;  setFilter: (v: any) => void;
  q: string;       setQ: (v: any) => void;
  // default fallbacks
  defaults?: { sortKey?: string; sortDir?: string; filter?: string; q?: string };
  // debounce ms for q
  debounceMs?: number;
};

export function useViewQuery({
  sortKey, setSortKey,
  sortDir, setSortDir,
  filter,  setFilter,
  q,       setQ,
  defaults = { sortKey: "createdAt", sortDir: "desc", filter: "all", q: "" },
  debounceMs = 200,
}: UseViewQueryOpts) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // 1) Hydrate from URL on mount (fall back to defaults)
  useEffect(() => {
    const get = (k: string) => params.get(k);
    setSortKey(get("sortKey") ?? defaults.sortKey!);
    setSortDir(get("sortDir") ?? defaults.sortDir!);
    setFilter (get("filter")  ?? defaults.filter!);
    setQ      (get("q")       ?? defaults.q!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const push = (next?: Partial<Record<string,string>>) => {
    const p = new URLSearchParams(params.toString());
    p.set("sortKey", sortKey);
    p.set("sortDir", sortDir);
    p.set("filter",  filter);
    if (q) p.set("q", q); else p.delete("q");
    if (next) for (const [k,v] of Object.entries(next)) (v ? p.set(k, v) : p.delete(k));
    router.replace(`${pathname}?${p.toString()}`);
  };

  // 2) Sync URL when non-text state changes (immediately)
  useEffect(() => { push(); /* sync */ }, [sortKey, sortDir, filter]); // eslint-disable-line

  // Debounce query to not spam
  const t = useRef<number | null>(null);
  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    t.current = window.setTimeout(() => push(), debounceMs);
    return () => { if (t.current) clearTimeout(t.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, debounceMs]);
}