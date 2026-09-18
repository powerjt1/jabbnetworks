import Link from "next/link";
import { Video } from "lucide-react";
import {
  Avatar,
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import {
  getContractsForUser,
  getCurrentUser,
  getJob,
  getUser,
} from "@/lib/data";
import { providers } from "@/lib/payments/config";
import { CONTRACT_TONE } from "@/lib/status";

export const metadata = { title: "Meetings" };

export default function MeetingsPage() {
  const user = getCurrentUser();
  const contracts = getContractsForUser(user.id).filter(
    (c) => c.status === "active",
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meetings"
        description="Each active contract has its own room. Private to the two of you, with screen share on."
      />

      {!providers.daily.configured && (
        <Card className="border-caution/25 bg-caution/5 p-4">
          <p className="text-sm font-medium text-caution">
            Video is not connected yet
          </p>
          <p className="mt-1 text-sm text-ink-2">
            Rooms open once you add a Daily.co API key. The free tier covers
            about 80 hours of two-person calls a month.
          </p>
        </Card>
      )}

      {contracts.length === 0 ? (
        <EmptyState
          icon={<Video className="size-6" />}
          title="No active contracts"
          description="Meeting rooms open automatically once a contract starts."
          action={<ButtonLink href="/jobs">Find work</ButtonLink>}
        />
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => {
            const job = getJob(contract.jobId);
            const other = getUser(
              user.id === contract.clientId
                ? contract.freelancerId
                : contract.clientId,
            );
            return (
              <Link
                key={contract.id}
                href={`/meetings/${contract.id}`}
                className="block group"
              >
                <Card className="flex flex-wrap items-center justify-between gap-4 p-4 transition-colors group-hover:border-brand/40">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar initials={other?.avatarInitials ?? "?"} />
                    <div className="min-w-0">
                      <p className="truncate font-medium transition-colors group-hover:text-brand-soft">
                        {job?.title}
                      </p>
                      <p className="truncate text-sm text-ink-3">
                        {other?.name}
                        {other?.company && ` · ${other.company}`} ·{" "}
                        {other?.timezone}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge tone={CONTRACT_TONE[contract.status]}>
                      {contract.status}
                    </Badge>
                    <span className="flex items-center gap-1.5 text-sm text-brand-soft">
                      <Video className="size-4" />
                      Join
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
