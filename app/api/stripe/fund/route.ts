import { NextResponse } from "next/server";
import { fundingFee } from "@/lib/payments/fees";
import { fundMilestone, stripe } from "@/lib/payments/stripe";
import type { FundingMethod } from "@/lib/payments/types";

/**
 * Funds a milestone into escrow and returns the client secret the browser
 * needs to confirm the payment.
 *
 * The amount is taken from the milestone record on the server, never from the
 * request body — a client-supplied amount would let anyone fund a $50,000
 * milestone for a dollar. Swap the lookup below for your database read.
 */
export async function POST(request: Request) {
  if (!stripe()) {
    return NextResponse.json(
      { error: "Stripe is not configured on this deployment." },
      { status: 503 },
    );
  }

  let body: {
    milestoneId?: string;
    contractId?: string;
    method?: FundingMethod;
    customerId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { milestoneId, contractId, method = "ach", customerId } = body;
  if (!milestoneId || !contractId) {
    return NextResponse.json(
      { error: "milestoneId and contractId are required." },
      { status: 400 },
    );
  }

  const milestone = await lookupMilestone(milestoneId, contractId);
  if (!milestone) {
    return NextResponse.json(
      { error: "Milestone not found." },
      { status: 404 },
    );
  }

  try {
    const fee = fundingFee(milestone.amount, method);
    const intent = await fundMilestone({
      milestoneId,
      contractId,
      amount: milestone.amount,
      fee,
      method,
      customerId,
    });

    return NextResponse.json({
      paymentIntentId: intent.id,
      clientSecret: intent.client_secret,
      amount: milestone.amount,
      fee,
      total: milestone.amount + fee,
    });
  } catch (error) {
    console.error("Milestone funding failed", error);
    return NextResponse.json(
      { error: "Could not start funding." },
      { status: 502 },
    );
  }
}

/**
 * Stand-in for the database read. Returns the authoritative milestone amount
 * in cents. Replace with a query that also checks the caller is the client on
 * this contract.
 */
async function lookupMilestone(
  milestoneId: string,
  contractId: string,
): Promise<{ amount: number } | null> {
  const { getContract } = await import("@/lib/data");
  const contract = getContract(contractId);
  const milestone = contract?.milestones.find((m) => m.id === milestoneId);
  if (!milestone) return null;
  return { amount: Math.round(milestone.amount * 100) };
}
