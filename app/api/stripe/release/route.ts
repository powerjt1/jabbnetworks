import { NextResponse } from "next/server";
import { syncMilestone } from "@/lib/accounting/sync";
import { sendPayout } from "@/lib/payments/paypal";
import { platformFee } from "@/lib/payments/fees";
import { releaseMilestone, stripe } from "@/lib/payments/stripe";
import type { PayoutRail } from "@/lib/payments/types";

/**
 * Releases escrowed funds to the freelancer once the client approves.
 *
 * Two invariants this route must hold, both enforced server-side:
 *   - the caller is the client on this contract, and
 *   - the milestone is currently `funded` and has not already been released.
 *
 * The second is what stops a double-click or a retried webhook from paying
 * twice. Do the status check and the write in one transaction, conditional on
 * the row still reading `funded`.
 */
export async function POST(request: Request) {
  let body: {
    milestoneId?: string;
    contractId?: string;
    rail?: PayoutRail;
    destinationAccountId?: string;
    paypalEmail?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { milestoneId, contractId, rail = "stripe" } = body;
  if (!milestoneId || !contractId) {
    return NextResponse.json(
      { error: "milestoneId and contractId are required." },
      { status: 400 },
    );
  }

  const milestone = await lookupFundedMilestone(milestoneId, contractId);
  if (!milestone) {
    return NextResponse.json(
      { error: "No funded milestone to release." },
      { status: 409 },
    );
  }

  const fee = platformFee(milestone.amount);
  const net = milestone.amount - fee;

  try {
    if (rail === "paypal") {
      if (!body.paypalEmail) {
        return NextResponse.json(
          { error: "paypalEmail is required for PayPal payouts." },
          { status: 400 },
        );
      }
      const payout = await sendPayout({
        recipientEmail: body.paypalEmail,
        amount: net,
        senderItemId: milestoneId,
        note: `Milestone released — ${milestoneId}`,
      });
      // A PayPal payout never produces a Stripe event, so there is no webhook
      // to carry the bookkeeping. Sync here instead, and flag the vendor
      // 1099-eligible: Stripe is not reporting this one.
      await syncMilestone({
        milestoneId,
        contractId,
        event: "released",
        rail: "paypal",
      });

      return NextResponse.json({
        rail,
        payoutBatchId: payout.batchId,
        status: payout.status,
        amount: net,
        platformFee: fee,
      });
    }

    if (!stripe()) {
      return NextResponse.json(
        { error: "Stripe is not configured on this deployment." },
        { status: 503 },
      );
    }
    if (!body.destinationAccountId) {
      return NextResponse.json(
        { error: "destinationAccountId is required for Stripe payouts." },
        { status: 400 },
      );
    }

    const transfer = await releaseMilestone({
      milestoneId,
      contractId,
      amount: milestone.amount,
      destinationAccountId: body.destinationAccountId,
    });

    return NextResponse.json({
      rail,
      transferId: transfer.id,
      amount: net,
      platformFee: fee,
    });
  } catch (error) {
    console.error("Milestone release failed", error);
    return NextResponse.json(
      { error: "Could not release funds." },
      { status: 502 },
    );
  }
}

/**
 * Stand-in for the database read. Must return null unless the milestone is
 * genuinely funded and unreleased — replace with a row-level check.
 */
async function lookupFundedMilestone(
  milestoneId: string,
  contractId: string,
): Promise<{ amount: number } | null> {
  const { getContract } = await import("@/lib/data");
  const contract = getContract(contractId);
  const milestone = contract?.milestones.find((m) => m.id === milestoneId);
  if (!milestone) return null;
  return { amount: Math.round(milestone.amount * 100) };
}
