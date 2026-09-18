import Link from "next/link";
import { MessageSquare } from "lucide-react";
import {
  Avatar,
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import {
  getConversations,
  getCurrentUser,
  getJob,
  getMessages,
  getUser,
} from "@/lib/data";
import { relativeTime } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default function MessagesPage() {
  const user = getCurrentUser();
  const conversations = getConversations(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Every thread stays attached to its job, so context does not get lost."
      />

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="size-6" />}
          title="No messages yet"
          description="Threads open when a client responds to a proposal."
          action={<ButtonLink href="/jobs">Find work</ButtonLink>}
        />
      ) : (
        <div className="space-y-3">
          {conversations.map((c) => {
            const otherId = c.participants.find((p) => p !== user.id);
            const person = otherId ? getUser(otherId) : undefined;
            const job = c.jobId ? getJob(c.jobId) : undefined;
            const last = getMessages(c.id).at(-1);

            return (
              <Link key={c.id} href={`/messages/${c.id}`} className="block group">
                <Card className="p-4 transition-colors group-hover:border-brand/40">
                  <div className="flex gap-3">
                    <Avatar initials={person?.avatarInitials ?? "?"} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium transition-colors group-hover:text-brand-soft">
                          {c.subject}
                        </p>
                        <div className="flex shrink-0 items-center gap-2">
                          {c.unreadCount > 0 && (
                            <Badge tone="brand">{c.unreadCount} new</Badge>
                          )}
                          <span className="text-xs text-ink-3">
                            {relativeTime(c.lastMessageAt)}
                          </span>
                        </div>
                      </div>
                      <p className="mt-0.5 text-sm text-ink-3">
                        {person?.name}
                        {person?.company && ` · ${person.company}`}
                        {job && ` · ${job.title}`}
                      </p>
                      {last && (
                        <p className="mt-2 line-clamp-1 text-sm text-ink-2">
                          {last.senderId === user.id && (
                            <span className="text-ink-3">You: </span>
                          )}
                          {last.body}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
