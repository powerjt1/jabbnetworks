"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Landmark,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { breakdown, formatCents } from "@/lib/payments/fees";
import type {
  EscrowStatus,
  FundingMethod,
  PayoutRail,
} from "@/lib/payments/types";
import { cn } from "@/lib/utils";

const TONE: Record<EscrowStatus, "neutral" | "brand" | "positive" | "caution" | "danger"> = {
  unfunded: "neutral",
  funding: "caution",
  funded: "brand",
  releasing: "caution",
  released: "positive",
  refunded: "neutral",
  failed: "danger",
};

const LABEL: Record<EscrowStatus, string> = {
  unfunded: "Not funded",
  funding: "Funding in transit",
  funded: "Held in escrow",
  releasing: "Releasing",
  released: "Released",
  refunded: "Refunded",
  failed: "Funding failed",
};

export function EscrowControls({
  milestoneId,
  contractId,
  /** Milestone value in cents. */
  amount,
  initialStatus,
  /** Clients fund and release; freelancers only watch. */
  viewerIsClient,
  configured,
}: {
  milestoneId: string;
  contractId: string;
  amount: number;
  initialStatus: EscrowStatus;
  viewerIsClient: boolean;
  configured: boolean;
}) {
  const [status, setStatus] = useState<EscrowStatus>(initialStatus);
  const [method, setMethod] = useState<FundingMethod>("ach");
  const [rail] = useState<PayoutRail>("stripe");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const fees = breakdown(amount, method, rail);

  async function call(path: string, next: EscrowStatus) {
    if (!configured) {
      setError(
        "Connect Stripe in .env.local to move real money. Nothing was charged.",
      );
      return;
    }
    setBusy(true);
    setError(undefined);
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, contractId, method, rail }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? "That did not go through.");
      }
      setStatus(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mt-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <Lock className="size-3.5 text-ink-3" />
          Escrow
        </span>
        <Badge tone={TONE[status]}>{LABEL[status]}</Badge>
      </div>

      {status === "unfunded" && viewerIsClient && (
        <div className="mt-4 space-y-4">
          <fieldset>
            <legend className="mb-2 text-xs font-medium tracking-wide text-ink-3 uppercase">
              Funding method
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["ach", "Bank transfer", Landmark],
                  ["card", "Card", ShieldCheck],
                ] as const
              ).map(([value, label, Icon]) => {
                const active = method === value;
                const fee =
                  value === "ach"
                    ? breakdown(amount, "ach", rail).fundingFee
                    : breakdown(amount, "card", rail).fundingFee;
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMethod(value)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors",
                      active
                        ? "border-brand bg-brand/10"
                        : "border-line bg-surface hover:border-line",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4",
                        active ? "text-brand-soft" : "text-ink-3",
                      )}
                    />
                    <p className="mt-2 text-sm font-medium">{label}</p>
                    <p className="mt-0.5 text-xs text-ink-3 tabular-nums">
                      {formatCents(fee)} fee
                    </p>
                  </button>
                );
              })}
            </div>
            {method === "card" && (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-caution">
                <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                Bank transfer would cost{" "}
                {formatCents(
                  breakdown(amount, "card", rail).fundingFee -
                    breakdown(amount, "ach", rail).fundingFee,
                )}{" "}
                less on this milestone.
              </p>
            )}
          </fieldset>

          <dl className="space-y-1.5 border-t border-line-soft pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-3">Milestone</dt>
              <dd className="tabular-nums">{formatCents(fees.amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-3">Processing</dt>
              <dd className="tabular-nums">{formatCents(fees.fundingFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-line-soft pt-1.5 font-medium">
              <dt>You pay</dt>
              <dd className="tabular-nums">{formatCents(fees.clientTotal)}</dd>
            </div>
          </dl>

          <Button
            className="w-full"
            disabled={busy}
            onClick={() => call("/api/stripe/fund", "funding")}
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Starting…
              </>
            ) : (
              <>
                <Lock className="size-4" />
                Fund {formatCents(fees.clientTotal)} into escrow
              </>
            )}
          </Button>
          <p className="text-xs text-ink-3">
            Held by JABB until you approve the work. Bank transfers clear in one
            to four business days.
          </p>
        </div>
      )}

      {status === "funding" && (
        <p className="mt-3 text-sm text-ink-2">
          The debit is in transit. Bank transfers take one to four business
          days; the freelancer is told the moment it clears.
        </p>
      )}

      {status === "funded" && (
        <div className="mt-4 space-y-4">
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-3">Held</dt>
              <dd className="tabular-nums">{formatCents(fees.amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-3">Platform fee</dt>
              <dd className="tabular-nums">−{formatCents(fees.platformFee)}</dd>
            </div>
            <div className="flex justify-between border-t border-line-soft pt-1.5 font-medium">
              <dt>Freelancer receives</dt>
              <dd className="tabular-nums text-positive">
                {formatCents(fees.freelancerNet)}
              </dd>
            </div>
          </dl>

          {viewerIsClient ? (
            <Button
              className="w-full"
              disabled={busy}
              onClick={() => call("/api/stripe/release", "released")}
            >
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Releasing…
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  Approve &amp; release
                </>
              )}
            </Button>
          ) : (
            <p className="flex items-start gap-1.5 text-sm text-ink-2">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-positive" />
              Funded and held. You are covered for this milestone — the money
              exists before you do the work.
            </p>
          )}
        </div>
      )}

      {status === "released" && (
        <p className="mt-3 flex items-start gap-1.5 text-sm text-ink-2">
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-positive" />
          {formatCents(fees.freelancerNet)} released. Stripe pays out on its
          normal schedule, typically two business days.
        </p>
      )}

      {status === "failed" && (
        <p className="mt-3 flex items-start gap-1.5 text-sm text-danger">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          The debit was returned. Nothing is held for this milestone.
        </p>
      )}

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {!configured && status === "unfunded" && (
        <p className="mt-3 text-xs text-ink-3">
          Demo mode — Stripe is not connected, so no money can move.
        </p>
      )}
    </Card>
  );
}
