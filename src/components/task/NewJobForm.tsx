"use client";

import { useState, useEffect, useRef } from "react";

export default function NewJobForm({ onJobCreated }: { onJobCreated: (job: any) => void }) {
    const [role, setRole] = useState("");
    const [company, setCompany] = useState("");
    const [location, setLocation] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const roleRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      roleRef.current?.focus();  // For refocus after entry
    }, []);


    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        try {
          const res = await fetch("/api/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role, company, location, note }),
        });

        let data: any = null;
        try { data = await res.json(); } catch {}

        if (res.ok) {
          onJobCreated(data); // Push to state
          setRole(""); setCompany(""); setLocation(""); setNote("");
          roleRef.current?.focus(); // Re-focus after job entry
        } else {
          alert(`Error: ${data?.error ?? res.statusText} ${data?.code ?? ""}`);
        }
      } finally {
        setLoading(false); // reset after completion
      }
    }

    return (
     <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "300px" }}>
      <input
        ref={roleRef}
        type="text"
        placeholder="Role"
        value={role}
        onChange={e => setRole(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Company"
        value={company}
        onChange={e => setCompany(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={e => setLocation(e.target.value)}
      />
      <textarea
        placeholder="Note"
        value={note}
        onChange={e => setNote(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Job"}
      </button>
     </form>
    )
}
