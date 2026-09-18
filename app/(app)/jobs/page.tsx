import Link from "next/link";
import { Paperclip, Plus, Users } from "lucide-react";
import {
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  PageHeader,
  SkillChip,
} from "@/components/ui";
import { JobFilters } from "@/components/job-filters";
import { getJobs } from "@/lib/data";
import type { SkillCategory } from "@/lib/types";
import { dueLabel, formatBudget, relativeTime } from "@/lib/utils";

export const metadata = { title: "Find work" };

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string | string[]; q?: string }>;
}) {
  const params = await searchParams;
  const selected = (
    Array.isArray(params.skill)
      ? params.skill
      : params.skill
        ? [params.skill]
        : []
  ) as SkillCategory[];

  const jobs = getJobs({ skills: selected, query: params.q });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Find work"
        description="Open contracts across Power Platform, RPA, migration and AI delivery."
        action={
          <ButtonLink href="/jobs/new">
            <Plus className="size-4" />
            Post a job
          </ButtonLink>
        }
      />

      <JobFilters selected={selected} query={params.q ?? ""} />

      <p className="text-sm text-ink-3">
        {jobs.length} {jobs.length === 1 ? "contract" : "contracts"}
        {selected.length > 0 && " matching your filters"}
      </p>

      {jobs.length === 0 ? (
        <EmptyState
          title="No contracts match those filters"
          description="Try removing a discipline or clearing your search."
          action={
            <ButtonLink href="/jobs" variant="secondary">
              Clear filters
            </ButtonLink>
          }
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const due = dueLabel(job.dueDate);
            return (
              <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
                <Card className="p-5 transition-colors group-hover:border-brand/40">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-medium text-pretty transition-colors group-hover:text-brand-soft">
                          {job.title}
                        </h2>
                        {job.featured && <Badge tone="brand">Featured</Badge>}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-ink-2">
                        {job.summary}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium tabular-nums">
                        {formatBudget(job.budgetMin, job.budgetMax, job.budgetType)}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-3">
                        {job.budgetType === "fixed" ? "Fixed price" : "Hourly"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.skills.map((s) => (
                      <SkillChip key={s} id={s} />
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line-soft pt-3 text-xs text-ink-3">
                    <span className="flex items-center gap-1.5">
                      <Users className="size-3.5" />
                      {job.proposalCount} proposals
                    </span>
                    {job.attachments.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Paperclip className="size-3.5" />
                        {job.attachments.length} attachments
                      </span>
                    )}
                    <span>{job.estimatedDuration}</span>
                    <span className="capitalize">{job.experienceLevel} level</span>
                    <span
                      className={
                        due.tone === "danger"
                          ? "text-danger"
                          : due.tone === "warn"
                            ? "text-caution"
                            : ""
                      }
                    >
                      {due.text}
                    </span>
                    <span className="ml-auto">
                      Posted {relativeTime(job.postedAt)}
                    </span>
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
