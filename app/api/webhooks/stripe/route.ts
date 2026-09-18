import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { syncMilestone } from "@/lib/accounting/sync";
import { stripe } from "@/lib/payments/stripe";

/**
 * Stripe webhook receiver.
 *
 * This route matters more than it looks. ACH debits do not settle inline —
 * they take one to four business days — so the moment a client clicks "fund"
 * the money is *not* in escrow yet. `payment_intent.succeeded` arriving here
 * is the only trustworthy signal that it is, and `payment_intent.payment_failed`
 * is how you learn a debit bounced days after you told the freelancer to start.
 *
 * Two rules:
 *   - Verify the signature. An unverified endpoint lets anyone mark milestones
 *     funded by POSTing JSON at it.
 *   - Handle events idempotently. Stripe retries, and the same event will
 *     arrive more than once. Key writes on `event.id`.
 */

export async function POST(request: Request) {
  const s = stripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!s || !secret) {
    return NextResponse.json(
      { error: "Webhooks are not configured on this deployment." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  // Raw body — parsing it first would invalidate the signature.
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = s.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    console.error("Webhook signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (await alreadyProcessed(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await onEscrowFunded({
          milestoneId: intent.metadata.milestone_id,
          contractId: intent.metadata.contract_id,
          paymentIntentId: intent.id,
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await onEscrowFailed({
          milestoneId: intent.metadata.milestone_id,
          reason:
            intent.last_payment_error?.message ?? "The payment was declined.",
        });
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        await onPayoutSent({
          milestoneId: transfer.metadata.milestone_id,
          contractId: transfer.metadata.contract_id,
          transferId: transfer.id,
        });
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await onConnectAccountUpdated({
          accountId: account.id,
          payoutsEnabled: account.payouts_enabled ?? false,
          requirementsDue: account.requirements?.currently_due ?? [],
        });
        break;
      }

      default:
        break;
    }

    await markProcessed(event.id);
    return NextResponse.json({ received: true });
  } catch (error) {
    // A 500 tells Stripe to retry, which is what we want for a transient
    // failure. Idempotency above keeps the retry safe.
    console.error(`Handling ${event.type} failed`, error);
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }
}

/* -------------------------------------------------------------------------
 * Persistence seams. Each is a no-op until a database is connected; wire them
 * to the escrow table and they become the system of record for money movement.
 * ---------------------------------------------------------------------- */

const processed = new Set<string>();

async function alreadyProcessed(eventId: string) {
  return processed.has(eventId);
}

async function markProcessed(eventId: string) {
  processed.add(eventId);
}

async function onEscrowFunded(params: {
  milestoneId?: string;
  contractId?: string;
  paymentIntentId: string;
}) {
  console.info("Escrow funded", params);
  // UPDATE escrow SET status='funded', funded_at=now() WHERE milestone_id=$1
  // then notify the freelancer that they are clear to start.

  if (params.milestoneId && params.contractId) {
    // Bookkeeping, not money movement: syncMilestone never throws, so a
    // QuickBooks outage cannot fail this webhook and send Stripe into a retry
    // loop over the escrow transition above.
    await syncMilestone({
      milestoneId: params.milestoneId,
      contractId: params.contractId,
      event: "funded",
    });
  }
}

async function onEscrowFailed(params: {
  milestoneId?: string;
  reason: string;
}) {
  console.warn("Escrow funding failed", params);
  // UPDATE escrow SET status='failed', failure_reason=$2 WHERE milestone_id=$1
  // then notify both sides — the freelancer may already be working.
}

async function onPayoutSent(params: {
  milestoneId?: string;
  contractId?: string;
  transferId: string;
}) {
  console.info("Payout sent", params);
  // UPDATE escrow SET status='released', transfer_id=$2 WHERE milestone_id=$1

  if (params.milestoneId && params.contractId) {
    await syncMilestone({
      milestoneId: params.milestoneId,
      contractId: params.contractId,
      event: "released",
      // A Stripe transfer is by definition the Stripe rail, so this payment is
      // reported by Stripe and the vendor is not flagged 1099-eligible here.
      rail: "stripe",
    });
  }
}

async function onConnectAccountUpdated(params: {
  accountId: string;
  payoutsEnabled: boolean;
  requirementsDue: string[];
}) {
  console.info("Connect account updated", params);
  // UPDATE payout_accounts SET payouts_enabled=$2, requirements_due=$3
  // WHERE stripe_account_id=$1
}
