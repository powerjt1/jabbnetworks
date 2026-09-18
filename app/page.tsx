import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  MessageSquare,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Avatar, Badge, ButtonLink, Card, SkillChip } from "@/components/ui";
import { getFreelancers, getJobs } from "@/lib/data";
import { SKILLS } from "@/lib/skills";
import { formatBudget, relativeTime } from "@/lib/utils";

const STEPS = [
  {
    icon: FileText,
    title: "Post the real scope",
    body: "Environments, constraints, ALM requirements, data residency. The specialists who matter filter on the details generalist boards throw away.",
  },
  {
    icon: MessageSquare,
    title: "Compare proposals that argue",
    body: "Every proposal carries a milestone plan and a delivery approach. The good ones push back on your dates — that is the signal you are looking for.",
  },
  {
    icon: Workflow,
    title: "Run it through milestones",
    body: "Budget released per milestone against named deliverables. Attachments, notes and the full thread stay on the contract.",
  },
];

export default function LandingPage() {
  const jobs = getJobs().slice(0, 4);
  const talent = getFreelancers().slice(0, 4);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-line-soft bg-canvas/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-brand font-bold text-white">
              J
            </span>
            <span className="font-semibold tracking-tight">JABB Networks</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm text-ink-2 md:flex">
            <Link href="/jobs" className="transition-colors hover:text-ink">
              Find work
            </Link>
            <Link href="/talent" className="transition-colors hover:text-ink">
              Hire talent
            </Link>
            <Link href="/jobs/new" className="transition-colors hover:text-ink">
              Post a job
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ButtonLink href="/login" variant="ghost" size="sm">
              Log in
            </ButtonLink>
            <ButtonLink href="/signup" size="sm">
              Get started
            </ButtonLink>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="aurora absolute inset-0 -z-10" />
        <div className="grid-lines absolute inset-0 -z-10" />
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <Badge tone="brand" className="mb-6">
            <ShieldCheck className="size-3" />
            Vetted Microsoft-stack specialists
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            The freelance network for enterprise automation work
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink-2 text-pretty">
            Power Platform, RPA, Nintex migration, SharePoint and AI delivery.
            Hire people who have decommissioned a workflow estate before, not
            people who have read about it.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/jobs/new" size="lg">
              Post a job
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/jobs" variant="secondary" size="lg">
              Browse open work
            </ButtonLink>
          </div>

          <dl className="mt-16 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
            {[
              { v: "2,400+", l: "Vetted specialists" },
              { v: "$41M", l: "Contracted through JABB" },
              { v: "96%", l: "Milestone approval rate" },
              { v: "11 days", l: "Median time to hire" },
            ].map((s) => (
              <div key={s.l}>
                <dt className="text-2xl font-semibold tabular-nums">{s.v}</dt>
                <dd className="mt-1 text-sm text-ink-3">{s.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-y border-line-soft bg-surface/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            Built around the stack you actually run
          </h2>
          <p className="mt-2 max-w-2xl text-ink-2">
            Ten disciplines, each with its own vetting path. Specialists are
            assessed on delivered work, not a self-reported skill list.
          </p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SKILLS.map((skill) => (
              <Card
                key={skill.id}
                className="p-4 transition-colors hover:border-line"
              >
                <SkillChip id={skill.id} />
                <p className="mt-3 text-sm text-ink-2">{skill.blurb}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title}>
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-brand/12 text-brand-soft ring-1 ring-brand/25">
                  <step.icon className="size-4" />
                </span>
                <span className="font-mono text-xs text-ink-3">
                  0{i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-medium">{step.title}</h3>
              <p className="mt-2 text-sm text-ink-2">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line-soft bg-surface/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              Open contracts
            </h2>
            <Link
              href="/jobs"
              className="text-sm text-brand-soft transition-colors hover:text-ink"
            >
              View all →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} className="group">
                <Card className="h-full p-5 transition-colors group-hover:border-brand/40">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium text-pretty transition-colors group-hover:text-brand-soft">
                      {job.title}
                    </h3>
                    {job.featured && <Badge tone="brand">Featured</Badge>}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-ink-2">
                    {job.summary}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {job.skills.map((s) => (
                      <SkillChip key={s} id={s} />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3 text-sm">
                    <span className="font-medium tabular-nums">
                      {formatBudget(job.budgetMin, job.budgetMax, job.budgetType)}
                    </span>
                    <span className="text-ink-3">
                      {job.proposalCount} proposals · {relativeTime(job.postedAt)}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            Specialists on the network
          </h2>
          <Link
            href="/talent"
            className="text-sm text-brand-soft transition-colors hover:text-ink"
          >
            Browse talent →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {talent.map((person) => (
            <Card key={person.id} className="p-5">
              <Avatar initials={person.avatarInitials} />
              <p className="mt-3 font-medium">{person.name}</p>
              <p className="text-sm text-ink-3">{person.title}</p>
              <div className="mt-3 flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-3.5 text-positive" />
                <span className="text-ink-2 tabular-nums">
                  {person.rating} · {person.jobsCompleted} contracts
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-t border-line-soft">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-semibold tracking-tight text-balance">
            Put your scope in front of people who have done it before
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-2 text-pretty">
            Posting is free. You only pay when you award a contract, and budget
            releases per milestone.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/signup" size="lg">
              Create an account
              <ArrowRight className="size-4" />
            </ButtonLink>
            <ButtonLink href="/jobs" variant="secondary" size="lg">
              Browse work first
            </ButtonLink>
          </div>
        </div>
      </section>

      <footer className="border-t border-line-soft">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded bg-brand text-xs font-bold text-white">
              J
            </span>
            <span>JABB Networks</span>
          </div>
          <nav className="flex flex-wrap gap-6">
            <Link href="/jobs" className="transition-colors hover:text-ink">
              Find work
            </Link>
            <Link href="/talent" className="transition-colors hover:text-ink">
              Hire talent
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-ink">
              Client portal
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
