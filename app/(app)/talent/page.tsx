import { Award, MapPin, Star } from "lucide-react";
import {
  Avatar,
  Badge,
  Card,
  PageHeader,
  SkillChip,
} from "@/components/ui";
import { getFreelancers } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const metadata = { title: "Talent" };

const AVAILABILITY = {
  available: { label: "Available now", tone: "positive" as const },
  limited: { label: "Limited availability", tone: "caution" as const },
  booked: { label: "Fully booked", tone: "neutral" as const },
};

export default function TalentPage() {
  const people = getFreelancers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Talent"
        description="Specialists on the network, vetted on delivered work rather than a self-reported skill list."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {people.map((person) => {
          const availability = AVAILABILITY[person.availability];
          return (
            <Card key={person.id} className="p-5">
              <div className="flex items-start gap-3">
                <Avatar initials={person.avatarInitials} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-medium">{person.name}</h2>
                    {person.verified && (
                      <Badge tone="brand">
                        <Award className="size-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-ink-3">{person.title}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-3">
                    <span className="flex items-center gap-1">
                      <Star className="size-3 text-caution" />
                      <span className="tabular-nums">
                        {person.rating} ({person.reviewCount})
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {person.location}
                    </span>
                  </div>
                </div>
                {person.hourlyRate && (
                  <div className="shrink-0 text-right">
                    <p className="font-medium tabular-nums">
                      {formatCurrency(person.hourlyRate)}
                    </p>
                    <p className="text-xs text-ink-3">per hour</p>
                  </div>
                )}
              </div>

              <p className="mt-4 text-sm text-ink-2">{person.bio}</p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {person.skills.map((s) => (
                  <SkillChip key={s} id={s} />
                ))}
              </div>

              {person.certifications.length > 0 && (
                <ul className="mt-4 space-y-1">
                  {person.certifications.map((cert) => (
                    <li
                      key={cert}
                      className="flex items-start gap-1.5 text-xs text-ink-3"
                    >
                      <Award className="mt-0.5 size-3 shrink-0" />
                      {cert}
                    </li>
                  ))}
                </ul>
              )}

              <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-line-soft pt-4 text-center">
                <div>
                  <dt className="text-xs text-ink-3">Contracts</dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {person.jobsCompleted}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-3">Success</dt>
                  <dd className="mt-0.5 font-medium tabular-nums">
                    {person.successRate}%
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-ink-3">Status</dt>
                  <dd className="mt-1">
                    <Badge tone={availability.tone}>{availability.label}</Badge>
                  </dd>
                </div>
              </dl>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
