import Link from "next/link";
import { Award, MapPin, Star, Users } from "lucide-react";
import {
  Avatar,
  Badge,
  Card,
  PageHeader,
  SkillChip,
} from "@/components/ui";
import { getAgencies, getCurrentUser, getAgenciesForUser } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Agencies" };

export default function AgenciesPage() {
  const user = getCurrentUser();
  const agencies = getAgencies();
  const mine = new Set(getAgenciesForUser(user.id).map((a) => a.id));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agencies"
        description="Teams that bid as one party. Larger scopes than a single contractor can carry, with a named roster on every proposal."
      />

      <div className="space-y-4">
        {agencies.map((agency) => (
          <Link key={agency.id} href={`/agencies/${agency.id}`} className="block group">
            <Card className="p-5 transition-colors group-hover:border-brand/40">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 gap-4">
                  <Avatar initials={agency.avatarInitials} size="lg" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium transition-colors group-hover:text-brand-soft">
                        {agency.name}
                      </h2>
                      {agency.verified && (
                        <Badge tone="brand">
                          <Award className="size-3" />
                          Verified
                        </Badge>
                      )}
                      {mine.has(agency.id) && <Badge tone="positive">Yours</Badge>}
                    </div>
                    <p className="mt-0.5 text-sm text-ink-2">{agency.tagline}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
                      <span className="flex items-center gap-1">
                        <Star className="size-3 text-caution" />
                        <span className="tabular-nums">
                          {agency.rating} ({agency.reviewCount})
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        {agency.members.length} specialists
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {agency.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-medium tabular-nums">
                    {formatCurrency(agency.dayRate)}
                  </p>
                  <p className="text-xs text-ink-3">blended day rate</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {agency.skills.map((s) => (
                  <SkillChip key={s} id={s} />
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3 text-xs text-ink-3">
                <span>{agency.contractsCompleted} contracts delivered</span>
                <span className="text-brand-soft">View team →</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
