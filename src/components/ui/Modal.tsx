"use client";
import { useEffect, useRef } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on Esc
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        ref={containerRef}
        className="relative z-10 w-full max-w-lg 
                  rounded-2xl 
                  bg-white/85 backdrop-blur-md 
                  border border-zinc-200
                  shadow-[0_10px_30px_rgba(0,0,0,0.08)]
                text-zinc-900 p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{title ?? "Edit"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center
                      h-8 w-8 rounded-full
                      hover:bg-zinc-100 active:bg-zinc-200
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
                      transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}