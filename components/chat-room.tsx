"use client";

import { useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { Avatar, Button, Card, Textarea } from "@/components/ui";
import type { Message, User } from "@/lib/types";
import { cn, formatBytes, formatTime, relativeTime } from "@/lib/utils";

export function ChatRoom({
  initialMessages,
  currentUser,
  other,
}: {
  initialMessages: Message[];
  currentUser: User;
  other: User;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");

  function send(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `msg_${Date.now()}`,
        conversationId: initialMessages[0]?.conversationId ?? "",
        senderId: currentUser.id,
        body,
        sentAt: new Date().toISOString(),
        attachments: [],
      },
    ]);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-4">
        {messages.map((m) => {
          const mine = m.senderId === currentUser.id;
          const author = mine ? currentUser : other;
          return (
            <div
              key={m.id}
              className={cn("flex gap-3", mine && "flex-row-reverse")}
            >
              <Avatar initials={author.avatarInitials} size="sm" />
              <div
                className={cn(
                  "min-w-0 max-w-[80%]",
                  mine ? "items-end text-right" : "items-start",
                )}
              >
                <div
                  className={cn(
                    "mb-1 flex items-center gap-2 text-xs text-ink-3",
                    mine && "justify-end",
                  )}
                >
                  <span className="font-medium text-ink-2">
                    {mine ? "You" : author.name}
                  </span>
                  <span>{formatTime(m.sentAt)}</span>
                </div>
                <div
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-left text-sm leading-relaxed whitespace-pre-wrap",
                    mine
                      ? "bg-brand/15 text-ink ring-1 ring-brand/25 ring-inset"
                      : "bg-surface-2 text-ink-2 ring-1 ring-line-soft ring-inset",
                  )}
                >
                  {m.body}
                </div>
                {m.attachments.length > 0 && (
                  <ul className={cn("mt-2 space-y-1.5", mine && "flex flex-col items-end")}>
                    {m.attachments.map((a) => (
                      <li key={a.id}>
                        <button
                          type="button"
                          className="flex items-center gap-2 rounded-lg border border-line-soft bg-surface px-3 py-2 text-left transition-colors hover:border-line"
                        >
                          <Paperclip className="size-3.5 shrink-0 text-ink-3" />
                          <span className="text-xs">
                            <span className="block">{a.name}</span>
                            <span className="block text-ink-3">
                              {formatBytes(a.size)}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Card className="sticky bottom-4 p-3">
        <form onSubmit={send} className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(e);
            }}
            placeholder={`Message ${other.name.split(" ")[0]}…`}
            className="min-h-20 border-0 bg-transparent px-1 focus:border-0"
          />
          <div className="flex items-center justify-between">
            <label className="cursor-pointer rounded-lg p-2 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink">
              <Paperclip className="size-4" />
              <span className="sr-only">Attach a file</span>
              <input type="file" multiple className="sr-only" />
            </label>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs text-ink-3 sm:inline">
                ⌘↵ to send
              </span>
              <Button type="submit" size="sm" disabled={!draft.trim()}>
                <Send className="size-3.5" />
                Send
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
