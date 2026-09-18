import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  Landmark,
} from "lucide-react";
import { ProviderStatus } from "@/components/provider-status";
import {
  Badge,
  ButtonLink,
  Card,
  PageHeader,
  StatTile,
} from "@/components/ui";
import { providers } from "@/lib/payments/config";
import { achSaving, formatCents, PLATFORM_FEE_BPS } from "@/lib/payments/fees";
import {
  BANK_ACCOUNTS,
  ESCROWS,
  getTransactions,
  PAYOUT_ACCOUNT,
} from "@/lib/payments/seed";
import { isPayPalConfigured } from "@/lib/payments/paypal";
import { formatDate, relativeTime } from "@/lib/utils";

export const metadata = { title: "Payments" };

const ESCROW_TONE = {
  unfunded: "neutral",
  funding: "caution",
  funded: "brand",
  releasing: "caution",
  released: "positive",
  refunded: "neutral",
  failed: "danger",
} as const;

export default function PaymentsPage() {
  const transactions = getTransactions();

  const inEscrow = ESCROWS.filter((e) => e.status === "funded").reduce(
    (sum, e) => sum + e.amount,
    0,
  );
  const released = ESCROWS.filter((e) => e.status === "released").reduce(
    (sum, e) => sum + e.amount,
    0,
  );
  const awaitingFunding = ESCROWS.filter((e) => e.status === "unfunded").reduce(
    (sum, e) => sum + e.amount,
    0,
  );
  const feesPaid = transactions.reduce((sum, t) => sum + t.fee, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        description="Escrow, payout rails and every movement of money on your contracts."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Held in escrow"
          value={formatCents(inEscrow)}
          sub="Funded, not yet released"
          tone="caution"
        />
        <StatTile
          label="Released to you"
          value={formatCents(released)}
          sub="Lifetime"
          tone="positive"
        />
        <StatTile
          label="Awaiting funding"
          value={formatCents(awaitingFunding)}
          sub="Client has not funded yet"
        />
        <StatTile
          label="Platform fees"
          value={formatCents(feesPaid)}
          sub={`${PLATFORM_FEE_BPS / 100}% of released value`}
        />
      </div>

      <ProviderStatus
        stripe={providers.stripe.configured}
        plaid={providers.plaid.configured}
        paypal={isPayPalConfigured() || providers.paypal.configured}
        daily={providers.daily.configured}
      />

      <section>
        <h2 className="mb-4 font-semibold tracking-tight">Payout account</h2>
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand/12 text-brand-soft ring-1 ring-brand/25">
                <Banknote className="size-4" />
              </span>
              <div>
                <p className="font-medium">Stripe Connect — Express</p>
                <p className="mt-0.5 text-sm text-ink-3">
                  Stripe collects your identity and tax details directly and
                  files your 1099. JABB never stores them.
                </p>
              </div>
            </div>
            {PAYOUT_ACCOUNT.payoutsEnabled ? (
              <Badge tone="positive">
                <CheckCircle2 className="size-3" />
                Payouts enabled
              </Badge>
            ) : (
              <Badge tone="caution">
                <AlertTriangle className="size-3" />
                Action needed
              </Badge>
            )}
          </div>

          {PAYOUT_ACCOUNT.requirementsDue.length > 0 && (
            <ul className="mt-4 space-y-1 border-t border-line-soft pt-4">
              {PAYOUT_ACCOUNT.requirementsDue.map((req) => (
                <li key={req} className="text-sm text-caution">
                  {req.replace(/_/g, " ")}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <section>
        <h2 className="mb-4 font-semibold tracking-tight">
          Linked bank accounts
        </h2>
        <div className="space-y-3">
          {BANK_ACCOUNTS.map((account) => (
            <Card key={account.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 text-ink-2 ring-1 ring-line">
                    <Landmark className="size-4" />
                  </span>
                  <div>
                    <p className="font-medium">
                      {account.institution} ••••{account.last4}
                    </p>
                    <p className="text-xs text-ink-3 capitalize">
                      {account.accountType} · linked{" "}
                      {formatDate(account.linkedAt)}
                    </p>
                  </div>
                </div>
                {account.verified && (
                  <Badge tone="positive">
                    <CheckCircle2 className="size-3" />
                    Verified via Plaid
                  </Badge>
                )}
              </div>
            </Card>
          ))}

          <Card className="border-dashed p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <CreditCard className="mt-0.5 size-4 shrink-0 text-ink-3" />
                <div>
                  <p className="text-sm font-medium">
                    Why clients fund by bank transfer
                  </p>
                  <p className="mt-1 max-w-lg text-sm text-ink-2">
                    On a {formatCents(2_200_000)} milestone, ACH costs{" "}
                    <span className="font-medium text-positive">
                      {formatCents(500)}
                    </span>{" "}
                    against{" "}
                    <span className="font-medium text-danger">
                      {formatCents(63_830)}
                    </span>{" "}
                    on a card — a saving of{" "}
                    <span className="font-medium">
                      {formatCents(achSaving(2_200_000))}
                    </span>{" "}
                    on that milestone alone. Plaid verifies the account
                    instantly so funding starts the same day.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-semibold tracking-tight">Escrow by milestone</h2>
        <Card className="divide-y divide-line-soft">
          {ESCROWS.map((escrow) => (
            <div
              key={escrow.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="font-mono text-xs text-ink-3">
                  {escrow.milestoneId}
                </p>
                <p className="mt-0.5 text-sm">
                  {escrow.fundedAt
                    ? `Funded ${relativeTime(escrow.fundedAt)}`
                    : "Not yet funded"}
                  {escrow.releasedAt &&
                    ` · released ${relativeTime(escrow.releasedAt)}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium tabular-nums">
                  {formatCents(escrow.amount)}
                </span>
                <Badge tone={ESCROW_TONE[escrow.status]}>{escrow.status}</Badge>
              </div>
            </div>
          ))}
        </Card>
      </section>

      <section>
        <h2 className="mb-4 font-semibold tracking-tight">Transactions</h2>
        <Card className="divide-y divide-line-soft">
          {transactions.map((tx) => {
            const incoming = tx.amount > 0;
            return (
              <div key={tx.id} className="flex items-center gap-3 p-4">
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
                    {tx.description}
                  </p>
                  <p className="text-xs text-ink-3">
                    {formatDate(tx.createdAt)} · {tx.method.toUpperCase()}
                    {tx.fee > 0 && ` · fee ${formatCents(tx.fee)}`}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-medium tabular-nums">
                    {formatCents(Math.abs(tx.amount))}
                  </p>
                  <p className="text-xs text-ink-3 capitalize">{tx.status}</p>
                </div>
              </div>
            );
          })}
        </Card>
      </section>

      <Card className="p-5">
        <h2 className="font-semibold tracking-tight">Connect your accounts</h2>
        <p className="mt-1.5 text-sm text-ink-2">
          You create the Stripe, PayPal, Plaid and Daily accounts yourself —
          they need your identity documents and a bank account, so no one else
          can do it for you. Once you have them, the keys go in{" "}
          <code className="rounded bg-surface-2 px-1 font-mono text-xs">
            .env.local
          </code>{" "}
          and everything on this page switches from demo data to live.
        </p>
        <ButtonLink
          href="https://dashboard.stripe.com/register"
          variant="secondary"
          size="sm"
          className="mt-4"
        >
          Open Stripe signup
        </ButtonLink>
      </Card>
    </div>
  );
}
