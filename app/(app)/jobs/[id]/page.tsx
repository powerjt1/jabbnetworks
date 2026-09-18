import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  Layers,
  MapPin,
  Users,
} from "lucide-react";
import { AttachmentList } from "@/components/attachment-list";
import { AssignmentTable } from "@/components/roster";
import { NotesPanel } from "@/components/notes-panel";
import {
  Avatar,
  Badge,
  ButtonLink,
  Card,
  SkillChip,
} from "@/components/ui";
import {
  getAgency,
  getCurrentUser,
  getJob,
  getJobs,
  getNotes,
  getProposalsForJob,
  getUser,
} from "@/lib/data";
import { MILESTONE_LABEL, MILESTONE_TONE, PROPOSAL_TONE } from "@/lib/status";
import {
  dueLabel,
  formatBudget,
  formatCurrency,
  formatDate,
  relativeTime,
} from "@/lib/utils";

export function generateStaticParams() {
  return getJobs().map((job) => ({ id: job.id }));
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) notFound();

  const client = getUser(job.clientId);
  const user = getCurrentUser();
  const proposals = getProposalsForJob(job.id);
  const myProposal = proposals.find((p) => p.freelancerId === user.id);
  const notes = getNotes(job.id);
  const due = dueLabel(job.dueDate);
  const totalMilestoneValue = job.milestones.reduce((s, m) => s + m.amount, 0);

  return (
    <div className="space-y-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        All work
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line-soft pb-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">
              {job.title}
            </h1>
            {job.featured && <Badge tone="brand">Featured</Badge>}
          </div>
          <p className="mt-2 max-w-2xl text-ink-2 text-pretty">{job.summary}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {job.skills.map((s) => (
              <SkillChip key={s} id={s} />
            ))}
          </div>
        </div>
        <div className="shrink-0">
          {myProposal ? (
            <Card className="p-4 text-center">
              <Badge tone={PROPOSAL_TONE[myProposal.status]}>
                Proposal {myProposal.status}
              </Badge>
              <p className="mt-2 text-sm text-ink-3">
                Submitted {relativeTime(myProposal.submittedAt)}
              </p>
              <ButtonLink
                href={`/proposals#${myProposal.id}`}
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
              >
                View proposal
              </ButtonLink>
            </Card>
          ) : (
            <ButtonLink href={`/jobs/${job.id}/propose`} size="lg">
              Submit a proposal
            </ButtonLink>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 font-semibold tracking-tight">Job scope</h2>
            <Card className="p-5">
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-ink-2">
                {job.scope}
              </div>
            </Card>
          </section>

          <section>
            <h2 className="mb-3 font-semibold tracking-tight">
              Milestones &amp; budget
            </h2>
            <Card className="divide-y divide-line-soft">
              {job.milestones.map((m, i) => (
                <div key={m.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-ink-3">
                          M{i + 1}
                        </span>
                        <p className="font-medium">{m.title}</p>
                      </div>
                      <p className="mt-1 text-sm text-ink-2">{m.description}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      {m.amount > 0 && (
                        <p className="font-medium tabular-nums">
                          {formatCurrency(m.amount)}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-ink-3">
                        {formatDate(m.dueDate)}
                      </p>
                    </div>
                  </div>
                  <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
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
                </div>
              ))}
              {totalMilestoneValue > 0 && (
                <div className="flex items-center justify-between p-4 text-sm">
                  <span className="text-ink-3">Total milestone value</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(totalMilestoneValue)}
                  </span>
                </div>
              )}
            </Card>
          </section>

          <section>
            <h2 className="mb-3 font-semibold tracking-tight">Attachments</h2>
            <AttachmentList items={job.attachments} />
          </section>

          {proposals.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold tracking-tight">
                Proposals ({job.proposalCount})
              </h2>
              <div className="space-y-3">
                {proposals.map((p) => {
                  const author = getUser(p.freelancerId);
                  if (!author) return null;
                  const agency = p.agencyId ? getAgency(p.agencyId) : undefined;
                  return (
                    <Card key={p.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar
                          initials={agency?.avatarInitials ?? author.avatarInitials}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="flex flex-wrap items-center gap-2 font-medium">
                              {agency ? (
                                <>
                                  <Link
                                    href={`/agencies/${agency.id}`}
                                    className="transition-colors hover:text-brand-soft"
                                  >
                                    {agency.name}
                                  </Link>
                                  <Badge tone="brand">
                                    <Building2 className="size-3" />
                                    Agency
                                  </Badge>
                                </>
                              ) : (
                                author.name
                              )}
                              {author.id === user.id && (
                                <span className="text-xs text-ink-3">(you)</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium tabular-nums">
                                {p.budgetType === "hourly"
                                  ? `${formatCurrency(p.bidAmount)}/hr`
                                  : formatCurrency(p.bidAmount)}
                              </span>
                              <Badge tone={PROPOSAL_TONE[p.status]}>
                                {p.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-ink-3">
                            {agency
                              ? `${agency.tagline} · led by ${author.name}`
                              : author.title}
                          </p>
                          <p className="mt-2 line-clamp-3 text-sm text-ink-2 whitespace-pre-wrap">
                            {p.coverLetter}
                          </p>
                          {p.assignments && p.assignments.length > 0 && (
                            <div className="mt-3 rounded-lg border border-line-soft bg-surface p-3">
                              <p className="mb-1 text-xs font-medium tracking-wide text-ink-3 uppercase">
                                Staffed by
                              </p>
                              <AssignmentTable
                                assignments={p.assignments}
                                users={
                                  new Map(
                                    p.assignments
                                      .map((a) => getUser(a.userId))
                                      .filter((u): u is NonNullable<typeof u> =>
                                        Boolean(u),
                                      )
                                      .map((u) => [u.id, u]),
                                  )
                                }
                                contractValue={p.bidAmount}
                              />
                            </div>
                          )}
                          <p className="mt-2 text-xs text-ink-3">
                            {p.estimatedDuration} · submitted{" "}
                            {relativeTime(p.submittedAt)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <Card className="p-4">
            <p className="text-xs font-medium tracking-wide text-ink-3 uppercase">
              Budget
            </p>
            <p className="mt-1.5 text-xl font-semibold tabular-nums">
              {formatBudget(job.budgetMin, job.budgetMax, job.budgetType)}
            </p>
            <p className="text-xs text-ink-3">
              {job.budgetType === "fixed" ? "Fixed price" : "Hourly rate"}
            </p>

            <dl className="mt-4 space-y-3 border-t border-line-soft pt-4 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-ink-3">Duration</dt>
                <dd>{job.estimatedDuration}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-3">Experience</dt>
                <dd className="capitalize">{job.experienceLevel}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-3">Proposals</dt>
                <dd className="tabular-nums">{job.proposalCount}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-3">Due</dt>
                <dd
                  className={
                    due.tone === "danger"
                      ? "text-danger"
                      : due.tone === "warn"
                        ? "text-caution"
                        : ""
                  }
                >
                  {formatDate(job.dueDate)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-3">Posted</dt>
                <dd>{relativeTime(job.postedAt)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-4">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
              <Layers className="size-3.5" />
              Environments
            </p>
            <div className="flex flex-wrap gap-1.5">
              {job.environments.map((env) => (
                <span
                  key={env}
                  className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs text-ink-2 ring-1 ring-line ring-inset"
                >
                  {env}
                </span>
              ))}
            </div>
          </Card>

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
              <dl className="mt-4 space-y-2 border-t border-line-soft pt-3 text-sm">
                <div className="flex items-center gap-2 text-ink-3">
                  <MapPin className="size-3.5" />
                  {client.location}
                </div>
                <div className="flex items-center gap-2 text-ink-3">
                  <Users className="size-3.5" />
                  {client.jobsCompleted} contracts posted
                </div>
                <div className="flex items-center gap-2 text-ink-3">
                  <CalendarClock className="size-3.5" />
                  On JABB since {formatDate(client.joinedAt)}
                </div>
              </dl>
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
