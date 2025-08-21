"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import type { Job } from "@/lib/types";
import { Field } from "@/components/ui/Field";
import { useFocusError } from "@/lib/hooks/useFocusError";

export default function EditJobModal({
  open,
  onClose,
  job,
  setJobs,
}: {
  open: boolean;
  onClose: () => void;
  job: Job;
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
}) {
  const firstRef = useRef<HTMLInputElement | null>(null);
  const companyRef  = useRef<HTMLInputElement | null>(null);
  const locationRef = useRef<HTMLInputElement | null>(null);
  const statusRef   = useRef<HTMLSelectElement | null>(null);
  const noteRef     = useRef<HTMLTextAreaElement | null>(null);

  // Define status options
  const STATUS_OPTIONS = ["applied", "interview", "rejected"] as const;
  type Status = typeof STATUS_OPTIONS[number];

  // local form state
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>("applied");
  const [favorite, setFavorite] = useState(false);
  const [saving, setSaving] = useState(false);

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Dirty state and disable saves when no change
  const dirty =                             
    role.trim() !== (job.role ?? "") ||
    company.trim() !== (job.company ?? "") ||
    location.trim() !== (job.location ?? "") ||
    note.trim() !== (job.note ?? "") ||
    status !== job.status ||
    favorite !== !!job.favorite;

  useFocusError(open, errors, { // Autofocus error line in modal
    role: firstRef,
    company: companyRef,
    location: locationRef,
    status: statusRef,
    note: noteRef,
  });

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

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {  // Enter for submit
    e.preventDefault();
    if (saving || !dirty) return;
    void handleSave();
  };

async function handleSave() {
  setSaving(true);
  setErrors({});
  setGeneralError(null);

  const id = job._id;
  const payload = {
    role: role.trim(),
    company: company.trim(),
    location: location.trim(),
    note: note.trim(),
    status,
    favorite,
  };

  const prevSnapshot = { ...job };

  // UI update
  setJobs(list => list.map(j => (j._id === id ? { ...j, ...payload } : j)));

  try {
    const res = await fetch(`/api/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok || !json?.ok) {
      // rollback
      setJobs(list => list.map(j => (j._id === id ? prevSnapshot : j)));
      if (json?.details) {
        const { mapZodDetails } = await import("@/lib/errorMap");
        setErrors(mapZodDetails(json.details));
      }
      setGeneralError(json?.error ?? res.statusText ?? "Failed to save");
      return; // keep modal open so error can be fixed
    }
    onClose();
  } catch (e: any) {
    setJobs(list => list.map(j => (j._id === id ? prevSnapshot : j)));
    setGeneralError(e?.message ?? "Network error");
  } finally {
    setSaving(false);
  }
  
}

  return (
<Modal open={open} onClose={onClose} title={`Edit: ${job.role} · ${job.company}`}>
  <form className="grid grid-cols-1 gap-3" onSubmit={onSubmit}>
    <div className="grid grid-cols-2 gap-3">
      <Field name="role" error={errors.role}>
        <input
          ref={firstRef}
          className="rounded border px-2 py-1.5 w-full"
          placeholder="Role"
          value={role}
          onChange={e => setRole(e.target.value)}
          minLength={2}
          maxLength={100}
        />
      </Field>

      <Field name="company" error={errors.company}>
        <input
          ref={companyRef}
          className="rounded border px-2 py-1.5 w-full"
          placeholder="Company"
          value={company}
          onChange={e => setCompany(e.target.value)}
          minLength={2}
          maxLength={100}
        />
      </Field>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <Field name="location" error={errors.location}>
        <input
          ref={locationRef}
          pattern="[\p{L}\s]+"
          className="rounded border px-2 py-1.5 w-full"
          placeholder="Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
      </Field>

      <Field name="status" error={errors.status}>
        <select
          ref={statusRef}
          className="rounded border px-2 py-1.5 w-full"
          value={status}
          onChange={e => setStatus(e.target.value as Job["status"])}
        >
          {STATUS_OPTIONS.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </Field>
    </div>

    <Field name="note" error={errors.note}>
      <textarea
        className="rounded border px-2 py-1.5 w-full"
        rows={3}
        placeholder="Note"
        value={note}
        onChange={e => setNote(e.target.value)}
        maxLength={250}
      />
      <div className="text-xs text-gray-500 mt-1">
        {note.length}/250
      </div>
    </Field>

    <Field name="favorite" error={errors.favorite}>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={favorite}
          onChange={e => setFavorite(e.target.checked)}
        />
        Favorite
      </label>
    </Field>

    {generalError && (
      <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1">
        {generalError}
      </div>
    )}

    <div className="mt-2 flex justify-end gap-2">
      <button onClick={onClose} type="button" className="rounded border px-3 py-1.5 text-sm">
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving || !dirty}
        className="rounded border px-3 py-1.5 text-sm font-medium bg-black text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  </form>
</Modal>
  );
}
