import Link from "next/link";
import { FileText } from "lucide-react";
import { AttachmentList } from "@/components/attachment-list";
import {
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import { getCurrentUser, getJob, getProposalsForUser, getUser } from "@/lib/data";
import { PROPOSAL_TONE } from "@/lib/status";
import { formatCurrency, formatDate, relativeTime } from "@/lib/utils";

export const metadata = { title: "Proposals" };

export default function ProposalsPage() {
  const user = getCurrentUser();
  const proposals = getProposalsForUser(user.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Proposals"
        description="Everything you have submitted and where each one stands."
      />

      {proposals.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-6" />}
          title="No proposals yet"
          description="When you submit a proposal it shows up here with its status."
          action={<ButtonLink href="/jobs">Find work</ButtonLink>}
        />
      ) : (
        <div className="space-y-4">
          {proposals.map((p) => {
            const job = getJob(p.jobId);
            const client = job ? getUser(job.clientId) : undefined;
            const total = p.milestones.reduce((s, m) => s + m.amount, 0);

            return (
              <Card key={p.id} id={p.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/jobs/${p.jobId}`}
                      className="font-medium transition-colors hover:text-brand-soft"
                    >
                      {job?.title}
                    </Link>
                    <p className="mt-0.5 text-sm text-ink-3">
                      {client?.company ?? client?.name} · submitted{" "}
                      {relativeTime(p.submittedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium tabular-nums">
                        {p.budgetType === "hourly"
                          ? `${formatCurrency(p.bidAmount)}/hr`
                          : formatCurrency(p.bidAmount)}
                      </p>
                      <p className="text-xs text-ink-3">{p.estimatedDuration}</p>
                    </div>
                    <Badge tone={PROPOSAL_TONE[p.status]}>{p.status}</Badge>
                  </div>
                </div>

                <div className="mt-4 border-t border-line-soft pt-4">
                  <p className="text-xs font-medium tracking-wide text-ink-3 uppercase">
                    Cover letter
                  </p>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-ink-2">
                    {p.coverLetter}
                  </p>
                </div>

                {p.milestones.length > 0 && (
                  <div className="mt-4 border-t border-line-soft pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium tracking-wide text-ink-3 uppercase">
                        Milestone plan
                      </p>
                      {total > 0 && (
                        <p className="text-sm font-medium tabular-nums">
                          {formatCurrency(total)}
                        </p>
                      )}
                    </div>
                    <ul className="mt-3 space-y-2">
                      {p.milestones.map((m, i) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="font-mono text-xs text-ink-3">
                              M{i + 1}
                            </span>
                            <span className="truncate text-sm">{m.title}</span>
                          </span>
                          <span className="shrink-0 text-xs text-ink-3 tabular-nums">
                            {m.amount > 0 && `${formatCurrency(m.amount)} · `}
                            {formatDate(m.dueDate)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {p.attachments.length > 0 && (
                  <div className="mt-4 border-t border-line-soft pt-4">
                    <p className="mb-2 text-xs font-medium tracking-wide text-ink-3 uppercase">
                      Attachments
                    </p>
                    <AttachmentList items={p.attachments} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
