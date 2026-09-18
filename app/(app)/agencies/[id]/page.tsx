import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  CalendarClock,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { Roster } from "@/components/roster";
import {
  Avatar,
  Badge,
  ButtonLink,
  Card,
  SkillChip,
  StatTile,
} from "@/components/ui";
import {
  canActForAgency,
  getAgencies,
  getAgency,
  getAgencyContracts,
  getCurrentUser,
  getJob,
  getRoster,
} from "@/lib/data";
import { CONTRACT_TONE } from "@/lib/status";
import { formatCurrency, formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return getAgencies().map((a) => ({ id: a.id }));
}

export default async function AgencyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agency = getAgency(id);
  if (!agency) notFound();

  const user = getCurrentUser();
  const roster = getRoster(agency.id);
  const contracts = getAgencyContracts(agency.id);
  const canManage = canActForAgency(agency.id, user.id);

  const delivered = contracts.reduce((sum, c) => sum + c.totalValue, 0);

  return (
    <div className="space-y-6">
      <Link
        href="/agencies"
        className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        All agencies
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line-soft pb-6">
        <div className="flex min-w-0 gap-4">
          <Avatar initials={agency.avatarInitials} size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {agency.name}
              </h1>
              {agency.verified && (
                <Badge tone="brand">
                  <Award className="size-3" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="mt-1 text-ink-2">{agency.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-3">
              <span className="flex items-center gap-1.5">
                <Star className="size-3.5 text-caution" />
                <span className="tabular-nums">
                  {agency.rating} ({agency.reviewCount} reviews)
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="size-3.5" />
                {agency.location}
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarClock className="size-3.5" />
                Since {formatDate(agency.foundedAt)}
              </span>
            </div>
          </div>
        </div>
        {canManage && (
          <ButtonLink href={`/agencies/${agency.id}/team`} variant="secondary">
            <Users className="size-4" />
            Manage team
          </ButtonLink>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Specialists"
          value={String(agency.members.length)}
          sub="On the roster"
        />
        <StatTile
          label="Contracts delivered"
          value={String(agency.contractsCompleted)}
        />
        <StatTile
          label="Blended day rate"
          value={formatCurrency(agency.dayRate)}
          sub="For time-priced work"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 font-semibold tracking-tight">About</h2>
            <Card className="p-5">
              <p className="text-sm leading-relaxed text-ink-2">{agency.bio}</p>
            </Card>
          </section>

          <section>
            <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
              <h2 className="font-semibold tracking-tight">Roster</h2>
              <p className="text-sm text-ink-3">
                Named on every proposal this agency submits
              </p>
            </div>
            <Card className="px-5 py-1">
              <Roster roster={roster} />
            </Card>
          </section>

          {contracts.length > 0 && (
            <section>
              <h2 className="mb-3 font-semibold tracking-tight">
                Contracts held
              </h2>
              <div className="space-y-3">
                {contracts.map((contract) => {
                  const job = getJob(contract.jobId);
                  return (
                    <Link
                      key={contract.id}
                      href={`/contracts/${contract.id}`}
                      className="block group"
                    >
                      <Card className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors group-hover:border-brand/40">
                        <div className="min-w-0">
                          <p className="truncate font-medium transition-colors group-hover:text-brand-soft">
                            {job?.title}
                          </p>
                          <p className="mt-0.5 text-sm text-ink-3">
                            {formatDate(contract.startedAt)} –{" "}
                            {formatDate(contract.dueDate)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="font-medium tabular-nums">
                            {formatCurrency(contract.totalValue)}
                          </span>
                          <Badge tone={CONTRACT_TONE[contract.status]}>
                            {contract.status}
                          </Badge>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <Card className="p-4">
            <p className="mb-3 text-xs font-medium tracking-wide text-ink-3 uppercase">
              Disciplines
            </p>
            <div className="flex flex-wrap gap-1.5">
              {agency.skills.map((s) => (
                <SkillChip key={s} id={s} />
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <p className="mb-3 text-xs font-medium tracking-wide text-ink-3 uppercase">
              How agencies are paid
            </p>
            <p className="text-sm text-ink-2">
              Milestones release to the agency as one party, then split between
              the assigned members by the shares agreed on the proposal. The
              client funds once and sees one invoice.
            </p>
            {delivered > 0 && (
              <p className="mt-3 border-t border-line-soft pt-3 text-sm">
                <span className="text-ink-3">Contracted on JABB: </span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(delivered)}
                </span>
              </p>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
