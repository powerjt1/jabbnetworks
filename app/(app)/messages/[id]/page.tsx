import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase } from "lucide-react";
import { ChatRoom } from "@/components/chat-room";
import { Avatar, Card, SkillChip } from "@/components/ui";
import {
  getConversation,
  getConversations,
  getCurrentUser,
  getJob,
  getMessages,
  getUser,
} from "@/lib/data";
import { CURRENT_USER_ID } from "@/lib/seed";
import { formatBudget } from "@/lib/utils";

export function generateStaticParams() {
  return getConversations(CURRENT_USER_ID).map((c) => ({ id: c.id }));
}

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conversation = getConversation(id);
  if (!conversation) notFound();

  const user = getCurrentUser();
  const otherId = conversation.participants.find((p) => p !== user.id);
  const other = otherId ? getUser(otherId) : undefined;
  if (!other) notFound();

  const messages = getMessages(conversation.id);
  const job = conversation.jobId ? getJob(conversation.jobId) : undefined;

  return (
    <div className="space-y-6">
      <Link
        href="/messages"
        className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Inbox
      </Link>

      <div className="flex items-center gap-3 border-b border-line-soft pb-6">
        <Avatar initials={other.avatarInitials} />
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight">
            {conversation.subject}
          </h1>
          <p className="truncate text-sm text-ink-3">
            {other.name}
            {other.company && ` · ${other.company}`} · {other.timezone}
          </p>
        </div>
      </div>

      {job && (
        <Link href={`/jobs/${job.id}`} className="block group">
          <Card className="p-4 transition-colors group-hover:border-brand/40">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
                  <Briefcase className="size-3" />
                  Related job
                </p>
                <p className="mt-1.5 font-medium transition-colors group-hover:text-brand-soft">
                  {job.title}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {job.skills.map((s) => (
                    <SkillChip key={s} id={s} />
                  ))}
                </div>
              </div>
              <span className="shrink-0 text-sm font-medium tabular-nums">
                {formatBudget(job.budgetMin, job.budgetMax, job.budgetType)}
              </span>
            </div>
          </Card>
        </Link>
      )}

      <ChatRoom
        initialMessages={messages}
        currentUser={user}
        other={other}
      />
    </div>
  );
}
