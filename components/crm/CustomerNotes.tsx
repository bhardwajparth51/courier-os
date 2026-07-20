"use client";

import { useState } from "react";
import { MessageSquare, Plus, User } from "lucide-react";

interface Props {
  customerId: string;
  initialNotes: any[];
}

export function CustomerNotes({ customerId, initialNotes }: Props) {
  const [notes, setNotes] = useState<any[]>(initialNotes);
  const [noteText, setNoteText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/customers/${customerId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteText }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotes([data.note, ...notes]);
        setNoteText("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* New Note Input Form */}
      <div className="card" style={{ padding: 18, marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Add Internal Staff Note</h3>
        <form onSubmit={handleAddNote} style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            className="input"
            placeholder="e.g. Business customer. Prefers evening pickups. Wants GST invoice..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ gap: 6, whitespace: "nowrap" }}>
            <Plus size={14} /> Add Note
          </button>
        </form>
      </div>

      {/* Internal Notes Feed */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {notes.map((n) => (
          <div key={n.id} className="card" style={{ padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-red)", display: "flex", alignItems: "center", gap: 4 }}>
                <User size={12} /> {n.authorName}
              </span>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace" }}>
                {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#111827", margin: 0 }}>{n.note}</p>
          </div>
        ))}

        {notes.length === 0 && (
          <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)", fontSize: 13 }}>
            No internal staff notes added yet.
          </div>
        )}
      </div>
    </div>
  );
}
