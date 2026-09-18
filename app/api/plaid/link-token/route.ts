import { NextResponse } from "next/server";
import { createLinkToken, plaid } from "@/lib/payments/plaid";

/** Issues the short-lived token the browser needs to open Plaid Link. */
export async function POST(request: Request) {
  if (!plaid()) {
    return NextResponse.json(
      { error: "Plaid is not configured on this deployment." },
      { status: 503 },
    );
  }

  let body: { userId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Take the user from the session once auth is wired, not from the body.
  if (!body.userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }

  try {
    const data = await createLinkToken(body.userId);
    return NextResponse.json({ linkToken: data.link_token });
  } catch (error) {
    console.error("Plaid link token failed", error);
    return NextResponse.json(
      { error: "Could not create a link token." },
      { status: 502 },
    );
  }
}
