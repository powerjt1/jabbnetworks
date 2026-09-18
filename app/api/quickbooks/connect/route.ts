import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { authorizeUrl, isQuickBooksConfigured } from "@/lib/accounting/quickbooks";

/**
 * Starts the Intuit consent flow.
 *
 * The `state` parameter is a CSRF token, not decoration: without checking it on
 * the way back, an attacker can complete the flow against their own Intuit
 * company and bind your books to it. It goes out here in a cookie and is
 * compared in the callback.
 */
export async function GET(request: Request) {
  if (!isQuickBooksConfigured()) {
    return NextResponse.json(
      { error: "QuickBooks is not configured on this deployment." },
      { status: 503 },
    );
  }

  const origin = new URL(request.url).origin;
  const state = randomBytes(24).toString("hex");

  const response = NextResponse.redirect(authorizeUrl({ origin, state }));
  response.cookies.set("qbo_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
