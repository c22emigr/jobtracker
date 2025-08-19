"use client";

import { useState, useEffect, useRef } from "react";
import { Job } from "@/lib/types";

export default function NewJobForm({
  onJobCreated,
}: {
  onJobCreated: (job: Job) => void; // better type instead of "any"
}) {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const roleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    roleRef.current?.focus(); // autofocus first input
  }, []);

  type ApiError = { error: string }; // Guard for submits

  function isApiError(v: unknown): v is ApiError {
    return !!v && typeof v === "object" && "error" in v;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return; // prevent double-submit if button spammed
    if (!role.trim() || !company.trim()) return; // block empty values

    setLoading(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: role.trim(),
          company: company.trim(),
          location: location.trim(),
          note: note.trim(),
        }),
      });

      let data: Job | null = null;
      try {
        data = await res.json();
      } catch {}

    if (res.ok) {
      const job = data as Job;
      onJobCreated(job);
      setRole("");
      setCompany("");
      setLocation("");
      setNote("");
      roleRef.current?.focus();
    } else {
      const msg = isApiError(data) ? data.error : res.statusText; 
      alert(`Error: ${msg}`);
    }
    } catch {
      alert("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        maxWidth: "300px",
      }}
    >
      <input
        ref={roleRef}
        type="text"
        placeholder="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        required
        disabled={loading}
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        disabled={loading}
      />
      <textarea
        placeholder="Note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Job"}
      </button>
    </form>
  );
}