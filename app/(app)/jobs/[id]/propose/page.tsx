import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProposalForm } from "@/components/proposal-form";
import { Card, PageHeader, SkillChip } from "@/components/ui";
import { getJob, getJobs } from "@/lib/data";
import { formatBudget, formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return getJobs().map((job) => ({ id: job.id }));
}

export default async function ProposePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/jobs/${job.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to job
      </Link>

      <PageHeader
        title="Submit a proposal"
        description="Clients read the approach before the number. Tell them what you would do first and why."
      />

      <Card className="p-5">
        <p className="text-xs font-medium tracking-wide text-ink-3 uppercase">
          Proposing on
        </p>
        <p className="mt-1.5 font-medium">{job.title}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.map((s) => (
            <SkillChip key={s} id={s} />
          ))}
        </div>
        <dl className="mt-4 grid gap-3 border-t border-line-soft pt-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-ink-3">Client budget</dt>
            <dd className="mt-0.5 font-medium tabular-nums">
              {formatBudget(job.budgetMin, job.budgetMax, job.budgetType)}
            </dd>
          </div>
          <div>
            <dt className="text-ink-3">Duration</dt>
            <dd className="mt-0.5 font-medium">{job.estimatedDuration}</dd>
          </div>
          <div>
            <dt className="text-ink-3">Due</dt>
            <dd className="mt-0.5 font-medium">{formatDate(job.dueDate)}</dd>
          </div>
        </dl>
      </Card>

      <ProposalForm
        jobId={job.id}
        budgetType={job.budgetType}
        suggestedMilestones={job.milestones.map((m) => ({
          title: m.title,
          amount: m.amount,
          dueDate: m.dueDate.slice(0, 10),
        }))}
      />
    </div>
  );
}
