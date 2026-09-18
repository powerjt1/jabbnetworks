import { NextResponse } from "next/server";
import {
  createConnectAccount,
  createOnboardingLink,
  getAccountStatus,
  stripe,
} from "@/lib/payments/stripe";

/**
 * Starts or resumes a freelancer's Connect onboarding and returns the hosted
 * link they complete it on.
 *
 * Replace the caller identity here with your session lookup once auth is
 * wired — this must never trust an account id sent by the browser, or one
 * freelancer could onboard against another's account.
 */
export async function POST(request: Request) {
  if (!stripe()) {
    return NextResponse.json(
      { error: "Stripe is not configured on this deployment." },
      { status: 503 },
    );
  }

  let body: { email?: string; accountId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.email) {
    return NextResponse.json({ error: "email is required." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;

  try {
    const accountId =
      body.accountId ??
      (await createConnectAccount({ email: body.email })).id;

    const link = await createOnboardingLink({
      accountId,
      returnUrl: `${origin}/payments?onboarding=complete`,
      refreshUrl: `${origin}/payments?onboarding=retry`,
    });

    return NextResponse.json({ accountId, url: link.url });
  } catch (error) {
    console.error("Connect onboarding failed", error);
    return NextResponse.json(
      { error: "Could not start onboarding." },
      { status: 502 },
    );
  }
}

export async function GET(request: Request) {
  if (!stripe()) {
    return NextResponse.json(
      { error: "Stripe is not configured on this deployment." },
      { status: 503 },
    );
  }

  const accountId = new URL(request.url).searchParams.get("accountId");
  if (!accountId) {
    return NextResponse.json(
      { error: "accountId is required." },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json(await getAccountStatus(accountId));
  } catch (error) {
    console.error("Connect status lookup failed", error);
    return NextResponse.json(
      { error: "Could not read account status." },
      { status: 502 },
    );
  }
}
