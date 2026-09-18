import Link from "next/link";
import { ScrollText } from "lucide-react";
import {
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  PageHeader,
  ProgressBar,
  StatTile,
} from "@/components/ui";
import {
  getContractsForUser,
  getCurrentUser,
  getJob,
  getUser,
} from "@/lib/data";
import { CONTRACT_TONE, MILESTONE_LABEL, MILESTONE_TONE } from "@/lib/status";
import { dueLabel, formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Contracts" };

export default function ContractsPage() {
  const user = getCurrentUser();
  const contracts = getContractsForUser(user.id);
  const active = contracts.filter((c) => c.status === "active");

  const totalValue = contracts.reduce((s, c) => s + c.totalValue, 0);
  const paid = contracts.reduce((s, c) => s + c.paidToDate, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        description="Milestones, budget released and what is outstanding."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Active" value={String(active.length)} />
        <StatTile
          label="Contracted value"
          value={formatCurrency(totalValue)}
          sub="Across all contracts"
        />
        <StatTile
          label="Released"
          value={formatCurrency(paid)}
          tone="positive"
          sub={`${formatCurrency(totalValue - paid)} outstanding`}
        />
      </div>

      {contracts.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="size-6" />}
          title="No contracts yet"
          description="When a client accepts your proposal the contract appears here."
          action={<ButtonLink href="/jobs">Find work</ButtonLink>}
        />
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => {
            const job = getJob(contract.jobId);
            const client = getUser(contract.clientId);
            const due = dueLabel(contract.dueDate);
            const next = contract.milestones.find(
              (m) => m.status === "active" || m.status === "submitted",
            );

            return (
              <Link
                key={contract.id}
                href={`/contracts/${contract.id}`}
                className="block group"
              >
                <Card className="p-5 transition-colors group-hover:border-brand/40">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-medium transition-colors group-hover:text-brand-soft">
                          {job?.title}
                        </h2>
                        <Badge tone={CONTRACT_TONE[contract.status]}>
                          {contract.status}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-sm text-ink-3">
                        {client?.company ?? client?.name} · started{" "}
                        {formatDate(contract.startedAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium tabular-nums">
                        {formatCurrency(contract.totalValue)}
                      </p>
                      <p
                        className={`text-xs ${
                          due.tone === "danger"
                            ? "text-danger"
                            : due.tone === "warn"
                              ? "text-caution"
                              : "text-ink-3"
                        }`}
                      >
                        {due.text}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <ProgressBar
                      value={contract.paidToDate}
                      max={contract.totalValue}
                    />
                    <div className="mt-2 flex justify-between text-xs text-ink-3 tabular-nums">
                      <span>
                        {formatCurrency(contract.paidToDate)} released
                      </span>
                      <span>
                        {
                          contract.milestones.filter(
                            (m) => m.status === "paid" || m.status === "approved",
                          ).length
                        }{" "}
                        of {contract.milestones.length} milestones
                      </span>
                    </div>
                  </div>

                  {next && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line-soft pt-3">
                      <span className="text-sm">
                        <span className="text-ink-3">Next: </span>
                        {next.title}
                      </span>
                      <Badge tone={MILESTONE_TONE[next.status]}>
                        {MILESTONE_LABEL[next.status]}
                      </Badge>
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
