import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  Info,
} from "lucide-react";
import {
  Badge,
  ButtonLink,
  Card,
  PageHeader,
  StatTile,
} from "@/components/ui";
import { isQuickBooksConfigured } from "@/lib/accounting/quickbooks";
import { formatCents, PLATFORM_FEE_BPS } from "@/lib/payments/fees";
import { QBO_SYNC_LOG } from "@/lib/tax/seed";
import { formatDate, relativeTime } from "@/lib/utils";

export const metadata = { title: "Accounting" };

export default async function AccountingPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const params = await searchParams;
  const configured = isQuickBooksConfigured();

  const fundedCents = QBO_SYNC_LOG.filter((e) => e.event === "funded").reduce(
    (s, e) => s + e.amountCents,
    0,
  );
  const releasedCents = QBO_SYNC_LOG.filter(
    (e) => e.event === "released",
  ).reduce((s, e) => s + e.amountCents, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Accounting"
        description="QuickBooks Online sync. Milestone money movement posts as it happens rather than on a nightly batch."
      />

      {params.error && (
        <Card className="border-danger/30 bg-danger/8 p-4">
          <p className="text-sm text-danger">
            {params.error === "state_mismatch"
              ? "The authorisation could not be verified and was rejected. Start again."
              : params.error === "denied"
                ? "Intuit did not return an authorisation. Nothing was connected."
                : "The token exchange failed. Nothing was connected."}
          </p>
        </Card>
      )}

      {params.connected && (
        <Card className="border-positive/30 bg-positive/8 p-4">
          <p className="flex items-center gap-2 text-sm text-positive">
            <CheckCircle2 className="size-4" />
            QuickBooks connected.
          </p>
        </Card>
      )}

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand/12 text-brand-soft ring-1 ring-brand/25">
              <BookOpen className="size-4" />
            </span>
            <div>
              <p className="font-medium">QuickBooks Online</p>
              <p className="mt-0.5 max-w-lg text-sm text-ink-2">
                Connected through Intuit OAuth. Access tokens last an hour and
                refresh tokens rotate on every use, so the connection renews
                itself as long as the rotated token is stored.
              </p>
            </div>
          </div>
          {configured ? (
            <ButtonLink href="/api/quickbooks/connect">
              Connect company
            </ButtonLink>
          ) : (
            <Badge tone="neutral">
              <CircleDashed className="size-3" />
              Not configured
            </Badge>
          )}
        </div>

        {!configured && (
          <div className="mt-4 border-t border-line-soft pt-4">
            <p className="text-sm text-ink-3">
              Create an app at{" "}
              <span className="font-mono text-brand-soft">
                developer.intuit.com
              </span>
              , then set:
            </p>
            <pre className="mt-2 overflow-x-auto rounded-lg bg-surface-2 p-3 font-mono text-xs text-ink-2">
              {`QBO_CLIENT_ID=...\nQBO_CLIENT_SECRET=...\nQBO_ENV=sandbox\nQBO_REDIRECT_URI=http://localhost:3000/api/quickbooks/callback`}
            </pre>
            <p className="mt-2 text-xs text-ink-3">
              Intuit gives you a sandbox company, so you can post real documents
              without touching live books.
            </p>
          </div>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Invoiced to clients"
          value={formatCents(fundedCents)}
          sub="Money in"
        />
        <StatTile
          label="Billed by payees"
          value={formatCents(releasedCents)}
          sub="Money out"
        />
        <StatTile
          label="Platform fee"
          value={`${PLATFORM_FEE_BPS / 100}%`}
          sub="The part that is revenue"
          tone="positive"
        />
      </div>

      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-4 shrink-0 text-ink-3" />
          <div className="text-sm text-ink-2">
            <p className="font-medium text-ink">
              Why each milestone posts twice
            </p>
            <p className="mt-1">
              This platform is an intermediary, so the gross flow is not
              revenue. Funding a milestone creates an{" "}
              <span className="font-medium">Invoice</span> and a Payment against
              the client; releasing it creates a{" "}
              <span className="font-medium">Bill</span> and a BillPayment to the
              payee. Only the difference — your fee — is income. Booking the
              gross as revenue would overstate it by more than tenfold.
            </p>
          </div>
        </div>
      </Card>

      <section>
        <h2 className="mb-4 font-semibold tracking-tight">Sync log</h2>
        <Card className="divide-y divide-line-soft">
          {QBO_SYNC_LOG.map((entry) => {
            const incoming = entry.event === "funded";
            return (
              <div key={entry.id} className="flex items-center gap-3 p-4">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-lg ring-1 ring-inset ${
                    incoming
                      ? "bg-caution/10 text-caution ring-caution/25"
                      : "bg-positive/10 text-positive ring-positive/25"
                  }`}
                >
                  {incoming ? (
                    <ArrowDownLeft className="size-4" />
                  ) : (
                    <ArrowUpRight className="size-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {entry.document}
                  </p>
                  <p className="text-xs text-ink-3">
                    {entry.milestoneId} · {formatDate(entry.syncedAt)} ·{" "}
                    {relativeTime(entry.syncedAt)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium tabular-nums">
                  {formatCents(entry.amountCents)}
                </span>
              </div>
            );
          })}
        </Card>
      </section>
    </div>
  );
}
