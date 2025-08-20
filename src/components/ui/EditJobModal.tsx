"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import type { Job } from "@/lib/types";

export default function EditJobModal({
  open,
  onClose,
  job,
  setJobs,
}: {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
}) {
  const firstRef = useRef<HTMLInputElement | null>(null);

  // local form state
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Job["status"]>("applied");
  const [favorite, setFavorite] = useState(false);
  const [saving, setSaving] = useState(false);

  // hydrate fields when opening / job changes
  useEffect(() => {
    if (open && job) {
      setRole(job.role ?? "");
      setCompany(job.company ?? "");
      setLocation(job.location ?? "");
      setNote(job.note ?? "");
      setStatus(job.status ?? "applied");
      setFavorite(!!job.favorite);
      setTimeout(() => firstRef.current?.focus(), 0);
    }
  }, [open, job]);

  if (!job) return null;

  async function handleSave() {
    const payload = {
      role: role.trim(),
      company: company.trim(),
      location: location.trim(),
      note: note.trim(),
      status,
      favorite,
    };

    setSaving(true);

    // optimistic UI
    setJobs(prev => prev.map(j => (j._id === job._id ? { ...j, ...payload } : j)));

    try {
      const res = await fetch(`/api/jobs/${job._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        // revert on failure (optional)
        alert("Failed to save changes");
      }
    } finally {
      setSaving(false);
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Edit: ${job.role} · ${job.company}`}>
      <div className="grid grid-cols-1 gap-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            ref={firstRef}
            className="rounded border px-2 py-1.5"
            placeholder="Role"
            value={role}
            onChange={e => setRole(e.target.value)}
          />
          <input
            className="rounded border px-2 py-1.5"
            placeholder="Company"
            value={company}
            onChange={e => setCompany(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            className="rounded border px-2 py-1.5"
            placeholder="Location"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
          <select
            className="rounded border px-2 py-1.5"
            value={status}
            onChange={e => setStatus(e.target.value as Job["status"])}
          >
            <option value="applied">applied</option>
            <option value="interview">interview</option>
            <option value="rejected">rejected</option>
          </select>
        </div>

        <textarea
          className="rounded border px-2 py-1.5"
          rows={3}
          placeholder="Note"
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={favorite}
            onChange={e => setFavorite(e.target.checked)}
          />
          Favorite
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <button onClick={onClose} className="rounded border px-3 py-1.5 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded border px-3 py-1.5 text-sm font-medium bg-black text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
