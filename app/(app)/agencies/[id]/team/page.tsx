import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { TeamManager } from "@/components/team-manager";
import { PageHeader } from "@/components/ui";
import {
  canActForAgency,
  getAgencies,
  getAgency,
  getAgencyContracts,
  getCurrentUser,
  getRoster,
} from "@/lib/data";

export function generateStaticParams() {
  return getAgencies().map((a) => ({ id: a.id }));
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agency = getAgency(id);
  if (!agency) notFound();

  const user = getCurrentUser();
  const roster = getRoster(agency.id);
  const canManage = canActForAgency(agency.id, user.id);

  // Price the split against a real contract where there is one, so the numbers
  // mean something rather than being abstract percentages.
  const contracts = getAgencyContracts(agency.id);
  const sampleValue =
    contracts.find((c) => c.status === "active")?.totalValue ??
    contracts[0]?.totalValue ??
    60_000;

  return (
    <div className="space-y-6">
      <Link
        href={`/agencies/${agency.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        {agency.name}
      </Link>

      <PageHeader
        title="Team"
        description="Who is on the roster, what each of them can do, and how contract value divides between them."
      />

      <TeamManager
        roster={roster}
        sampleValue={sampleValue}
        canManage={canManage}
      />
    </div>
  );
}
