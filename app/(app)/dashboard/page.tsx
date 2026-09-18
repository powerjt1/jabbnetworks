import Link from "next/link";
import { ArrowRight, CalendarClock, MessageSquare } from "lucide-react";
import {
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  PageHeader,
  ProgressBar,
  SkillChip,
  StatTile,
} from "@/components/ui";
import {
  getContractsForUser,
  getConversations,
  getCurrentUser,
  getDashboardStats,
  getJob,
  getJobs,
  getProposalsForUser,
  getUser,
} from "@/lib/data";
import { MILESTONE_TONE, PROPOSAL_TONE } from "@/lib/status";
import {
  dueLabel,
  formatBudget,
  formatCurrency,
  relativeTime,
} from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const user = getCurrentUser();
  const stats = getDashboardStats(user.id);
  const contracts = getContractsForUser(user.id).filter(
    (c) => c.status === "active",
  );
  const proposals = getProposalsForUser(user.id);
  const conversations = getConversations(user.id).slice(0, 3);
  const recommended = getJobs()
    .filter((j) => j.skills.some((s) => user.skills.includes(s)))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Good afternoon, ${user.name.split(" ")[0]}`}
        description="Where your contracts, proposals and approvals stand right now."
        action={
          <ButtonLink href="/jobs">
            Find work
            <ArrowRight className="size-4" />
          </ButtonLink>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Active contracts"
          value={String(stats.activeContracts)}
          sub={`${formatCurrency(stats.activeValue)} contracted`}
        />
        <StatTile
          label="Outstanding"
          value={formatCurrency(stats.outstanding)}
          sub="Across open milestones"
          tone="caution"
        />
        <StatTile
          label="Paid to date"
          value={formatCurrency(stats.paidToDate)}
          sub="Lifetime on JABB"
          tone="positive"
        />
        <StatTile
          label="Open proposals"
          value={String(stats.openProposals)}
          sub="Awaiting a decision"
        />
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <h2 className="font-semibold tracking-tight">Milestones needing attention</h2>
          <Link href="/contracts" className="text-sm text-brand-soft hover:text-ink">
            All contracts →
          </Link>
        </div>
        {stats.openMilestones.length === 0 ? (
          <EmptyState
            icon={<CalendarClock className="size-6" />}
            title="Nothing outstanding"
            description="Every milestone on your active contracts is approved."
          />
        ) : (
          <div className="space-y-3">
            {contracts.flatMap((contract) => {
              const job = getJob(contract.jobId);
              const client = getUser(contract.clientId);
              return contract.milestones
                .filter((m) => m.status === "active" || m.status === "submitted")
                .map((m) => {
                  const due = dueLabel(m.dueDate);
                  return (
                    <Link key={m.id} href={`/contracts/${contract.id}`} className="block group">
                      <Card className="p-4 transition-colors group-hover:border-brand/40">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium transition-colors group-hover:text-brand-soft">
                              {m.title}
                            </p>
                            <p className="mt-0.5 text-sm text-ink-3">
                              {job?.title} · {client?.company ?? client?.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge tone={MILESTONE_TONE[m.status]}>
                              {m.status}
                            </Badge>
                            <Badge
                              tone={
                                due.tone === "danger"
                                  ? "danger"
                                  : due.tone === "warn"
                                    ? "caution"
                                    : "neutral"
                              }
                            >
                              {due.text}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <span className="text-ink-3">
                            {m.deliverables.length} deliverables
                          </span>
                          <span className="font-medium tabular-nums">
                            {formatCurrency(m.amount)}
                          </span>
                        </div>
                      </Card>
                    </Link>
                  );
                });
            })}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <h2 className="font-semibold tracking-tight">Active contracts</h2>
          </div>
          <div className="space-y-3">
            {contracts.map((contract) => {
              const job = getJob(contract.jobId);
              const client = getUser(contract.clientId);
              return (
                <Link key={contract.id} href={`/contracts/${contract.id}`} className="block group">
                  <Card className="p-4 transition-colors group-hover:border-brand/40">
                    <p className="font-medium transition-colors group-hover:text-brand-soft">
                      {job?.title}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-3">
                      {client?.company ?? client?.name}
                    </p>
                    <div className="mt-3">
                      <ProgressBar
                        value={contract.paidToDate}
                        max={contract.totalValue}
                      />
                      <div className="mt-2 flex justify-between text-xs text-ink-3 tabular-nums">
                        <span>
                          {formatCurrency(contract.paidToDate)} released
                        </span>
                        <span>{formatCurrency(contract.totalValue)} total</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <h2 className="font-semibold tracking-tight">Recent messages</h2>
            <Link href="/messages" className="text-sm text-brand-soft hover:text-ink">
              Inbox →
            </Link>
          </div>
          <div className="space-y-3">
            {conversations.map((c) => {
              const other = c.participants.find((p) => p !== user.id);
              const person = other ? getUser(other) : undefined;
              return (
                <Link key={c.id} href={`/messages/${c.id}`} className="block group">
                  <Card className="p-4 transition-colors group-hover:border-brand/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium transition-colors group-hover:text-brand-soft">
                          {c.subject}
                        </p>
                        <p className="mt-0.5 text-sm text-ink-3">
                          {person?.name} · {relativeTime(c.lastMessageAt)}
                        </p>
                      </div>
                      {c.unreadCount > 0 && (
                        <Badge tone="brand">
                          <MessageSquare className="size-3" />
                          {c.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <h2 className="font-semibold tracking-tight">Matched to your stack</h2>
          <Link href="/jobs" className="text-sm text-brand-soft hover:text-ink">
            All work →
          </Link>
        </div>
        <div className="space-y-3">
          {recommended.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
              <Card className="p-4 transition-colors group-hover:border-brand/40">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="font-medium transition-colors group-hover:text-brand-soft">
                    {job.title}
                  </p>
                  <span className="text-sm font-medium tabular-nums">
                    {formatBudget(job.budgetMin, job.budgetMax, job.budgetType)}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-1 text-sm text-ink-2">
                  {job.summary}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.skills.map((s) => (
                    <SkillChip key={s} id={s} />
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {proposals.length > 0 && (
        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <h2 className="font-semibold tracking-tight">Your proposals</h2>
            <Link href="/proposals" className="text-sm text-brand-soft hover:text-ink">
              All proposals →
            </Link>
          </div>
          <div className="space-y-3">
            {proposals.map((p) => {
              const job = getJob(p.jobId);
              return (
                <Link key={p.id} href={`/jobs/${p.jobId}`} className="block group">
                  <Card className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors group-hover:border-brand/40">
                    <div className="min-w-0">
                      <p className="font-medium transition-colors group-hover:text-brand-soft">
                        {job?.title}
                      </p>
                      <p className="mt-0.5 text-sm text-ink-3">
                        Submitted {relativeTime(p.submittedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium tabular-nums">
                        {p.budgetType === "hourly"
                          ? `${formatCurrency(p.bidAmount)}/hr`
                          : formatCurrency(p.bidAmount)}
                      </span>
                      <Badge tone={PROPOSAL_TONE[p.status]}>{p.status}</Badge>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
