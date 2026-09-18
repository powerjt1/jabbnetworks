import {
  AlertTriangle,
  CheckCircle2,
  FileWarning,
  Info,
  ShieldCheck,
} from "lucide-react";
import { W9Panel } from "@/components/w9-panel";
import {
  Avatar,
  Badge,
  Card,
  PageHeader,
  ProgressBar,
  StatTile,
} from "@/components/ui";
import { getUser } from "@/lib/data";
import { formatCents } from "@/lib/payments/fees";
import {
  complianceState,
  filingDeadline,
  REPORTING_THRESHOLD_CENTS,
  STATE_LABEL,
  STATE_TONE,
} from "@/lib/tax/thresholds";
import { getComplianceRows, TAX_YEAR } from "@/lib/tax/seed";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Tax & compliance" };

export default function TaxPage() {
  const rows = getComplianceRows()
    .map((row) => {
      const user = getUser(row.ytd.payeeId);
      return {
        ...row,
        name: user?.name ?? row.ytd.payeeId,
        initials: user?.avatarInitials ?? "?",
        state: complianceState({
          ytd: row.ytd,
          form: row.form,
          usesNonStripeRail: row.usesNonStripeRail,
        }),
      };
    })
    // Problems first — this page exists to surface them.
    .sort((a, b) => {
      const rank = {
        threshold_crossed_no_form: 0,
        form_invalid: 1,
        threshold_approaching: 2,
        form_missing: 3,
        ok: 4,
        not_required: 5,
      } as const;
      return rank[a.state] - rank[b.state];
    });

  const blocking = rows.filter(
    (r) => r.state === "threshold_crossed_no_form" || r.state === "form_invalid",
  );
  const reportable = rows.reduce((s, r) => s + r.ytd.reportableCents, 0);
  const stripeHandled = rows.reduce((s, r) => s + r.ytd.stripeReportedCents, 0);
  const willFile = rows.filter(
    (r) => r.ytd.reportableCents >= REPORTING_THRESHOLD_CENTS,
  ).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tax & compliance"
        description={`Contractor reporting for ${TAX_YEAR}. Covers payments Stripe does not report on.`}
      />

      {blocking.length > 0 && (
        <Card className="border-danger/30 bg-danger/8 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-danger" />
            <div>
              <p className="font-medium text-danger">
                {blocking.length}{" "}
                {blocking.length === 1 ? "payee needs" : "payees need"} a valid
                W-9 before you can file
              </p>
              <p className="mt-1 text-sm text-ink-2">
                Each has passed the reporting threshold on a rail Stripe does
                not cover. Without a usable form you cannot file their 1099-NEC,
                and backup withholding applies to further payments. Filing is
                due {formatDate(filingDeadline(TAX_YEAR).toISOString())}.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="You must report"
          value={formatCents(reportable)}
          sub="Non-Stripe rails"
          tone={blocking.length > 0 ? "caution" : "neutral"}
        />
        <StatTile
          label="Stripe reports"
          value={formatCents(stripeHandled)}
          sub="Filed by Stripe Connect"
          tone="positive"
        />
        <StatTile
          label="1099s to file"
          value={String(willFile)}
          sub={`Over ${formatCents(REPORTING_THRESHOLD_CENTS)}`}
        />
        <StatTile
          label="Needs attention"
          value={String(blocking.length)}
          tone={blocking.length > 0 ? "caution" : "neutral"}
          sub={blocking.length === 0 ? "All clear" : "Missing or invalid W-9"}
        />
      </div>

      <Card className="p-4">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-4 shrink-0 text-ink-3" />
          <p className="text-sm text-ink-2">
            The reporting threshold is{" "}
            <span className="font-medium">
              {formatCents(REPORTING_THRESHOLD_CENTS)}
            </span>{" "}
            per payee per year in this configuration. It moved from $600 to
            $2,000 for payments made after 31 December 2025 and is indexed
            thereafter, so confirm the figure for your filing year with an
            accountant — it is set in{" "}
            <code className="rounded bg-surface-2 px-1 font-mono text-xs">
              lib/tax/thresholds.ts
            </code>
            .
          </p>
        </div>
      </Card>

      <section>
        <h2 className="mb-4 font-semibold tracking-tight">Payees</h2>
        <div className="space-y-3">
          {rows.map((row) => {
            // The bar clamps at full, but the label must not: someone at 370%
            // of the threshold is not "100%", and on a compliance dashboard
            // that difference is the whole point.
            const pct = Math.round(
              (row.ytd.reportableCents / REPORTING_THRESHOLD_CENTS) * 100,
            );
            const over = row.ytd.reportableCents > REPORTING_THRESHOLD_CENTS;
            return (
              <Card key={row.ytd.payeeId} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <Avatar initials={row.initials} />
                    <div className="min-w-0">
                      <p className="font-medium">{row.name}</p>
                      <p className="mt-0.5 text-sm text-ink-3">
                        {row.usesNonStripeRail
                          ? row.form
                            ? `${row.form.formType.toUpperCase()} ••••${row.form.tinLast4} · ${row.form.classification.replace(/_/g, " ")}`
                            : "No form on file"
                          : "Paid through Stripe — reported by Stripe"}
                      </p>
                    </div>
                  </div>
                  <Badge tone={STATE_TONE[row.state]}>
                    {row.state === "ok" && <CheckCircle2 className="size-3" />}
                    {(row.state === "form_invalid" ||
                      row.state === "threshold_crossed_no_form") && (
                      <FileWarning className="size-3" />
                    )}
                    {row.state === "not_required" && (
                      <ShieldCheck className="size-3" />
                    )}
                    {STATE_LABEL[row.state]}
                  </Badge>
                </div>

                {row.usesNonStripeRail && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-ink-3 tabular-nums">
                      <span>
                        {formatCents(row.ytd.reportableCents)} reportable
                      </span>
                      <span>
                        threshold {formatCents(REPORTING_THRESHOLD_CENTS)}
                      </span>
                    </div>
                    <ProgressBar
                      className="mt-1.5"
                      value={row.ytd.reportableCents}
                      max={REPORTING_THRESHOLD_CENTS}
                    />
                    <p
                      className={`mt-1 text-xs ${over ? "text-caution" : "text-ink-3"}`}
                    >
                      {over
                        ? `${formatCents(row.ytd.reportableCents - REPORTING_THRESHOLD_CENTS)} over the threshold — a 1099-NEC is due`
                        : `${pct}% of threshold`}
                    </p>
                  </div>
                )}

                {row.form?.invalidReason && (
                  <p className="mt-3 flex items-start gap-1.5 border-t border-line-soft pt-3 text-sm text-danger">
                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                    {row.form.invalidReason}
                  </p>
                )}

                {row.ytd.stripeReportedCents > 0 && (
                  <p className="mt-3 border-t border-line-soft pt-3 text-xs text-ink-3">
                    Plus {formatCents(row.ytd.stripeReportedCents)} paid through
                    Stripe, which Stripe reports separately.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-semibold tracking-tight">Your W-9</h2>
        <W9Panel />
      </section>
    </div>
  );
}
