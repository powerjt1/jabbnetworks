import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ShieldCheck, Users } from "lucide-react";
import { MeetingRoom } from "@/components/meeting-room";
import { Avatar, Card } from "@/components/ui";
import { providers } from "@/lib/payments/config";
import {
  getContract,
  getContracts,
  getCurrentUser,
  getJob,
  getUser,
} from "@/lib/data";

export function generateStaticParams() {
  return getContracts().map((c) => ({ id: c.id }));
}

export default async function MeetingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contract = getContract(id);
  if (!contract) notFound();

  const user = getCurrentUser();
  const job = getJob(contract.jobId);
  const client = getUser(contract.clientId);
  const freelancer = getUser(contract.freelancerId);

  return (
    <div className="space-y-6">
      <Link
        href={`/contracts/${contract.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to contract
      </Link>

      <div className="border-b border-line-soft pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          {job?.title}
        </h1>
        <p className="mt-1.5 text-ink-2">
          Meeting room for this contract
        </p>
      </div>

      <MeetingRoom
        contractId={contract.id}
        userName={user.name}
        isOwner={user.id === contract.clientId}
        configured={providers.daily.configured}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
            <Users className="size-3.5" />
            Participants
          </p>
          <ul className="space-y-3">
            {[client, freelancer].filter(Boolean).map((person) => (
              <li key={person!.id} className="flex items-center gap-3">
                <Avatar initials={person!.avatarInitials} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {person!.name}
                    {person!.id === user.id && (
                      <span className="ml-1.5 text-xs text-ink-3">(you)</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-ink-3">
                    {person!.timezone}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-medium tracking-wide text-ink-3 uppercase">
            <ShieldCheck className="size-3.5" />
            Room policy
          </p>
          <ul className="space-y-2 text-sm text-ink-2">
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-positive" />
              Private — only contract participants get a token
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-3.5 shrink-0 text-ink-3" />
              Expires two hours after it opens
            </li>
            <li className="flex items-start gap-2">
              <Users className="mt-0.5 size-3.5 shrink-0 text-ink-3" />
              Knocking is on, so nobody joins unadmitted
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
