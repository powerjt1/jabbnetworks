import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  MessageSquare,
} from "lucide-react";
import { AttachmentList } from "@/components/attachment-list";
import { NotesPanel } from "@/components/notes-panel";
import {
  Avatar,
  Badge,
  ButtonLink,
  Card,
  ProgressBar,
  StatTile,
} from "@/components/ui";
import {
  getContract,
  getContracts,
  getConversations,
  getCurrentUser,
  getJob,
  getNotes,
  getUser,
} from "@/lib/data";
import { CONTRACT_TONE, MILESTONE_LABEL, MILESTONE_TONE } from "@/lib/status";
import { dueLabel, formatCurrency, formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return getContracts().map((c) => ({ id: c.id }));
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = getContract(id);
  if (!contract) notFound();

  const job = getJob(contract.jobId);
  const client = getUser(contract.clientId);
  const user = getCurrentUser();
  const notes = getNotes(contract.id);
  const due = dueLabel(contract.dueDate);

  const conversation = getConversations(user.id).find(
    (c) => c.jobId === contract.jobId,
  );

  const outstanding = contract.totalValue - contract.paidToDate;
  const approved = contract.milestones.filter(
    (m) => m.status === "paid" || m.status === "approved",
  ).length;

  return (
    <div className="space-y-6">
      <Link
        href="/contracts"
        className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        All contracts
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line-soft pb-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              {job?.title}
            </h1>
            <Badge tone={CONTRACT_TONE[contract.status]}>
              {contract.status}
            </Badge>
          </div>
          <p className="mt-1.5 text-ink-2">
            {client?.company ?? client?.name} · {formatDate(contract.startedAt)}{" "}
            – {formatDate(contract.dueDate)}
          </p>
        </div>
        {conversation && (
          <ButtonLink href={`/messages/${conversation.id}`} variant="secondary">
            <MessageSquare className="size-4" />
            Message client
          </ButtonLink>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatTile
          label="Contract value"
          value={formatCurrency(contract.totalValue)}
        />
        <StatTile
          label="Released"
          value={formatCurrency(contract.paidToDate)}
          tone="positive"
        />
        <StatTile
          label="Outstanding"
          value={formatCurrency(outstanding)}
          tone={outstanding > 0 ? "caution" : "neutral"}
        />
        <StatTile
          label="Due"
          value={formatDate(contract.dueDate)}
          sub={due.text}
          tone={due.tone === "danger" ? "caution" : "neutral"}
        />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Budget released</span>
          <span className="text-ink-3 tabular-nums">
            {approved} of {contract.milestones.length} milestones approved
          </span>
        </div>
        <ProgressBar
          className="mt-3"
          value={contract.paidToDate}
          max={contract.totalValue}
        />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 font-semibold tracking-tight">Milestones</h2>
            <div className="space-y-3">
              {contract.milestones.map((m, i) => {
                const mDue = dueLabel(m.dueDate);
                const done = m.status === "paid" || m.status === "approved";
                return (
                  <Card key={m.id} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        {done ? (
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-positive" />
                        ) : (
                          <Circle className="mt-0.5 size-4 shrink-0 text-ink-3" />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-ink-3">
                              M{i + 1}
                            </span>
                            <p className="font-medium">{m.title}</p>
                          </div>
                          <p className="mt-1 text-sm text-ink-2">
                            {m.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="font-medium tabular-nums">
                          {formatCurrency(m.amount)}
                        </span>
                        <Badge tone={MILESTONE_TONE[m.status]}>
                          {MILESTONE_LABEL[m.status]}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line-soft pt-3">
                      <ul className="flex flex-wrap gap-x-4 gap-y-1">
                        {m.deliverables.map((d) => (
                          <li
                            key={d}
                            className="flex items-center gap-1.5 text-xs text-ink-3"
                          >
                            <CheckCircle2 className="size-3" />
                            {d}
                          </li>
                        ))}
                      </ul>
                      <span
                        className={`ml-auto text-xs ${
                          mDue.tone === "danger"
                            ? "text-danger"
                            : mDue.tone === "warn"
                              ? "text-caution"
                              : "text-ink-3"
                        }`}
                      >
                        {mDue.text}
                      </span>
                    </div>

                    {m.status === "active" && (
                      <div className="mt-3 flex gap-2">
                        <ButtonLink href={`/contracts/${contract.id}`} size="sm">
                          Submit for approval
                        </ButtonLink>
                      </div>
                    )}
                    {m.status === "submitted" && (
                      <p className="mt-3 text-xs text-caution">
                        Waiting on {client?.name} to approve.
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </section>

          {job && job.attachments.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold tracking-tight">
                Attachments
              </h2>
              <AttachmentList items={job.attachments} />
            </section>
          )}

          {job && (
            <section>
              <h2 className="mb-3 font-semibold tracking-tight">Job scope</h2>
              <Card className="p-5">
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-ink-2">
                  {job.scope}
                </div>
              </Card>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          {client && (
            <Card className="p-4">
              <p className="mb-3 text-xs font-medium tracking-wide text-ink-3 uppercase">
                Client
              </p>
              <div className="flex items-center gap-3">
                <Avatar initials={client.avatarInitials} />
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {client.company ?? client.name}
                  </p>
                  <p className="truncate text-sm text-ink-3">{client.name}</p>
                </div>
              </div>
              <p className="mt-3 border-t border-line-soft pt-3 text-sm text-ink-2">
                {client.bio}
              </p>
            </Card>
          )}

          <div>
            <h2 className="mb-3 font-semibold tracking-tight">Your notes</h2>
            <NotesPanel initial={notes} />
          </div>
        </aside>
      </div>
    </div>
  );
}
