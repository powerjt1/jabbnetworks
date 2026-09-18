import { NextResponse } from "next/server";
import { exchangeForStripeToken, plaid } from "@/lib/payments/plaid";
import { attachBankAccount, stripe } from "@/lib/payments/stripe";

/**
 * Turns the public token from Plaid Link into a reusable Stripe payment
 * method. The bank's account and routing numbers never reach this server —
 * Plaid hands Stripe a processor token and the two settle it between
 * themselves, which is the reason to run Plaid at all.
 */
export async function POST(request: Request) {
  if (!plaid() || !stripe()) {
    return NextResponse.json(
      { error: "Bank linking is not configured on this deployment." },
      { status: 503 },
    );
  }

  let body: { publicToken?: string; accountId?: string; customerId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.publicToken || !body.accountId || !body.customerId) {
    return NextResponse.json(
      { error: "publicToken, accountId and customerId are required." },
      { status: 400 },
    );
  }

  try {
    const { processorToken } = await exchangeForStripeToken({
      publicToken: body.publicToken,
      accountId: body.accountId,
    });

    await attachBankAccount({
      customerId: body.customerId,
      processorToken,
    });

    return NextResponse.json({ linked: true });
  } catch (error) {
    // Deliberately vague to the caller — the detail belongs in logs, not in a
    // response that a browser can read.
    console.error("Plaid exchange failed", error);
    return NextResponse.json(
      { error: "Could not link that account." },
      { status: 502 },
    );
  }
}
