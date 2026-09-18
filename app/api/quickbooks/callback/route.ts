import { NextResponse } from "next/server";
import { exchangeCode, isQuickBooksConfigured } from "@/lib/accounting/quickbooks";

/** Where Intuit sends the user back after consent. */
export async function GET(request: Request) {
  if (!isQuickBooksConfigured()) {
    return NextResponse.json(
      { error: "QuickBooks is not configured on this deployment." },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const realmId = url.searchParams.get("realmId");
  const state = url.searchParams.get("state");

  const expected = request.headers
    .get("cookie")
    ?.match(/qbo_oauth_state=([^;]+)/)?.[1];

  // Reject before touching Intuit: a mismatched state means this callback did
  // not originate from a flow we started.
  if (!state || !expected || state !== expected) {
    return NextResponse.redirect(
      new URL("/accounting?error=state_mismatch", url.origin),
    );
  }

  if (!code || !realmId) {
    return NextResponse.redirect(
      new URL("/accounting?error=denied", url.origin),
    );
  }

  try {
    const tokens = await exchangeCode({ code, origin: url.origin, realmId });

    // Persist the token set against the platform's accounting connection.
    // Intuit rotates the refresh token on every use, so whatever writes here
    // must overwrite rather than insert, or the connection dies in 100 days.
    await persistConnection(tokens);

    const response = NextResponse.redirect(
      new URL("/accounting?connected=1", url.origin),
    );
    response.cookies.delete("qbo_oauth_state");
    return response;
  } catch (error) {
    console.error("QuickBooks token exchange failed", error);
    return NextResponse.redirect(
      new URL("/accounting?error=exchange_failed", url.origin),
    );
  }
}

async function persistConnection(tokens: {
  refreshToken: string;
  expiresAt: number;
  realmId: string;
}) {
  // UPSERT INTO accounting_connections (provider, realm_id, refresh_token,
  //   access_token_expires_at) VALUES ('quickbooks', $1, $2, $3)
  // Encrypt the refresh token at rest: it is a bearer credential for the
  // company's whole ledger.
  console.info("QuickBooks connected", {
    realmId: tokens.realmId,
    expiresAt: tokens.expiresAt,
  });
}
