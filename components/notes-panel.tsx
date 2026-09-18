"use client";

import { useState } from "react";
import { Pin, StickyNote } from "lucide-react";
import { Button, Card, Textarea } from "@/components/ui";
import type { Note } from "@/lib/types";
import { cn, relativeTime } from "@/lib/utils";

export function NotesPanel({ initial }: { initial: Note[] }) {
  const [notes, setNotes] = useState(initial);
  const [draft, setDraft] = useState("");

  function addNote(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setNotes((prev) => [
      {
        id: `n_${Date.now()}`,
        entityId: initial[0]?.entityId ?? "",
        authorId: "u_you",
        body,
        createdAt: new Date().toISOString(),
        pinned: false,
      },
      ...prev,
    ]);
    setDraft("");
  }

  function togglePin(id: string) {
    setNotes((prev) =>
      prev
        .map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }),
    );
  }

  return (
    <div className="space-y-3">
      <form onSubmit={addNote} className="space-y-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Private note — only you can see this."
          className="min-h-20"
        />
        <Button type="submit" size="sm" disabled={!draft.trim()}>
          Add note
        </Button>
      </form>

      {notes.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-ink-3">
          <StickyNote className="size-4" />
          No notes yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {notes.map((note) => (
            <li key={note.id}>
              <Card
                className={cn(
                  "p-3",
                  note.pinned && "border-caution/30 bg-caution/5",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-ink-2 whitespace-pre-wrap">
                    {note.body}
                  </p>
                  <button
                    type="button"
                    onClick={() => togglePin(note.id)}
                    aria-label={note.pinned ? "Unpin note" : "Pin note"}
                    aria-pressed={note.pinned}
                    className={cn(
                      "shrink-0 rounded p-1 transition-colors",
                      note.pinned
                        ? "text-caution"
                        : "text-ink-3 hover:text-ink",
                    )}
                  >
                    <Pin className="size-3.5" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-ink-3">
                  {relativeTime(note.createdAt)}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
