import { NextResponse } from "next/server";
import {
  getPayoutStatus,
  isPayPalConfigured,
  sendPayout,
} from "@/lib/payments/paypal";
import { platformFee } from "@/lib/payments/fees";

/**
 * Pays a freelancer through PayPal rather than Stripe Connect. Funding always
 * runs through Stripe; this is a payout rail only.
 */
export async function POST(request: Request) {
  if (!isPayPalConfigured()) {
    return NextResponse.json(
      { error: "PayPal is not configured on this deployment." },
      { status: 503 },
    );
  }

  let body: { milestoneId?: string; recipientEmail?: string; amount?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.milestoneId || !body.recipientEmail) {
    return NextResponse.json(
      { error: "milestoneId and recipientEmail are required." },
      { status: 400 },
    );
  }

  // Read the escrowed amount from the milestone, never from the request.
  const amount = body.amount ?? 0;
  if (amount <= 0) {
    return NextResponse.json({ error: "Nothing to pay out." }, { status: 409 });
  }

  const fee = platformFee(amount);

  try {
    const payout = await sendPayout({
      recipientEmail: body.recipientEmail,
      amount: amount - fee,
      // Stable per milestone, so a retry cannot pay twice.
      senderItemId: body.milestoneId,
      note: `Milestone released — ${body.milestoneId}`,
    });
    return NextResponse.json({ ...payout, platformFee: fee });
  } catch (error) {
    console.error("PayPal payout failed", error);
    return NextResponse.json(
      { error: "Could not send the payout." },
      { status: 502 },
    );
  }
}

export async function GET(request: Request) {
  if (!isPayPalConfigured()) {
    return NextResponse.json(
      { error: "PayPal is not configured on this deployment." },
      { status: 503 },
    );
  }
  const batchId = new URL(request.url).searchParams.get("batchId");
  if (!batchId) {
    return NextResponse.json({ error: "batchId is required." }, { status: 400 });
  }
  try {
    return NextResponse.json(await getPayoutStatus(batchId));
  } catch (error) {
    console.error("PayPal status lookup failed", error);
    return NextResponse.json({ error: "Lookup failed." }, { status: 502 });
  }
}
