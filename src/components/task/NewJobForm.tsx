"use client";
import { useState } from "react";

export default function NewJobForm() {
    const [role, setRole] = useState("");
    const [company, setCompany] = useState("");
    const [location, setLocation] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, company, location, note }),
        });

        let data: any = null;
        try { data = await res.json(); } catch {}

        if (res.ok) {
        setRole(""); setCompany(""); setLocation(""); setNote("");
        } else {
        alert(`Error: ${data?.error ?? res.statusText} ${data?.code ?? ""}`);
        }
    }

    return (
     <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: "300px" }}>
      <input
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
