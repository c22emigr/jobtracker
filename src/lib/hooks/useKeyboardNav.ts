"use client";
import { useCallback } from "react";

type Interactive =
  | "BUTTON" | "INPUT" | "TEXTAREA" | "SELECT" | "A" | "AREA" | "SUMMARY";

const INTERACTIVE: Interactive[] = [
  "BUTTON", "INPUT", "TEXTAREA", "SELECT", "A", "AREA", "SUMMARY",
];

export function useKeyboardNav({
  itemCount,
  getActiveIndex,
  setActiveIndex,
  onEnter,
  loop = true,
  ignoreTags = INTERACTIVE,
}: {
  itemCount: number;
  getActiveIndex: () => number | null;
  setActiveIndex: React.Dispatch<React.SetStateAction<number | null>>;
  onEnter?: (index: number) => void;
  loop?: boolean;
  ignoreTags?: Interactive[];
}) {
  return useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const tag = (e.target as HTMLElement).tagName.toUpperCase();
      if (ignoreTags.includes(tag as Interactive)) return;
      if (!itemCount) return;

      const cur = getActiveIndex();

      const move = (delta: number) =>
        setActiveIndex((prev) => {
          const i = prev == null ? (delta > 0 ? 0 : itemCount - 1) : prev + delta;
          if (loop) return ((i % itemCount) + itemCount) % itemCount;
          return Math.max(0, Math.min(itemCount - 1, i));
        });

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          move(1);
          break;
        case "ArrowUp":
          e.preventDefault();
          move(-1);
          break;
        case "Home":
          e.preventDefault();
          setActiveIndex(itemCount ? 0 : null);
          break;
        case "End":
          e.preventDefault();
          setActiveIndex(itemCount ? itemCount - 1 : null);
          break;
        case "Enter":
          if (cur != null && onEnter) {
            e.preventDefault();
            onEnter(cur);
          }
          break;
      }
    },
    [ignoreTags, itemCount, loop, onEnter, setActiveIndex, getActiveIndex]
  );
}