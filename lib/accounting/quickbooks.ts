/**
 * SERVER ONLY. QuickBooks Online via Intuit's OAuth 2.0 API.
 *
 * The accounting model matters more than the transport. This platform is an
 * intermediary: money comes in from a client and goes out to a freelancer, and
 * only the platform fee is revenue. Booking the gross flow as income would
 * overstate revenue by more than an order of magnitude — a $64,000 contract is
 * roughly $5,120 of actual income at an 8% fee.
 *
 * So each milestone produces two documents, not one:
 *
 *   funding  -> Invoice (to the client)  + Payment       money in
 *   release  -> Bill    (from the payee) + BillPayment   money out
 *
 * The difference between them falls out as the fee, and lands in the income
 * account named by QBO_FEE_INCOME_ACCOUNT.
 */

const SANDBOX = "https://sandbox-quickbooks.api.intuit.com";
const PRODUCTION = "https://quickbooks.api.intuit.com";

export function isQuickBooksConfigured() {
  return Boolean(
    process.env.QBO_CLIENT_ID && process.env.QBO_CLIENT_SECRET,
  );
}

function apiBase() {
  return process.env.QBO_ENV === "production" ? PRODUCTION : SANDBOX;
}

export function redirectUri(origin: string) {
  return process.env.QBO_REDIRECT_URI ?? `${origin}/api/quickbooks/callback`;
}

/** Intuit's consent screen. `state` is a CSRF token the callback must match. */
export function authorizeUrl(params: { origin: string; state: string }) {
  const clientId = process.env.QBO_CLIENT_ID;
  if (!clientId) throw new Error("QBO_CLIENT_ID is not set.");

  const url = new URL("https://appcenter.intuit.com/connect/oauth2");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "com.intuit.quickbooks.accounting");
  url.searchParams.set("redirect_uri", redirectUri(params.origin));
  url.searchParams.set("state", params.state);
  return url.toString();
}

interface TokenSet {
  accessToken: string;
  refreshToken: string;
  /** Unix ms. */
  expiresAt: number;
  realmId: string;
}

async function tokenRequest(body: URLSearchParams): Promise<Omit<TokenSet, "realmId">> {
  const id = process.env.QBO_CLIENT_ID;
  const secret = process.env.QBO_CLIENT_SECRET;
  if (!id || !secret) throw new Error("QuickBooks is not configured.");

  const res = await fetch(
    "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
      cache: "no-store",
    },
  );

  if (!res.ok) {
    // Deliberately no body echo — Intuit error payloads can carry the code.
    throw new Error(`Intuit token request failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function exchangeCode(params: {
  code: string;
  origin: string;
  realmId: string;
}): Promise<TokenSet> {
  const tokens = await tokenRequest(
    new URLSearchParams({
      grant_type: "authorization_code",
      code: params.code,
      redirect_uri: redirectUri(params.origin),
    }),
  );
  return { ...tokens, realmId: params.realmId };
}

/**
 * Intuit rotates the refresh token on every use, so the new one must be
 * persisted or the connection dies at the next refresh. Access tokens last an
 * hour; refresh tokens last 100 days.
 */
export async function refreshTokens(
  refreshToken: string,
  realmId: string,
): Promise<TokenSet> {
  const tokens = await tokenRequest(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  );
  return { ...tokens, realmId };
}

async function qbo<T>(params: {
  tokens: TokenSet;
  path: string;
  method?: "GET" | "POST";
  body?: unknown;
}): Promise<T> {
  const res = await fetch(
    `${apiBase()}/v3/company/${params.tokens.realmId}/${params.path}`,
    {
      method: params.method ?? "GET",
      headers: {
        Authorization: `Bearer ${params.tokens.accessToken}`,
        Accept: "application/json",
        ...(params.body ? { "Content-Type": "application/json" } : {}),
      },
      body: params.body ? JSON.stringify(params.body) : undefined,
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`QuickBooks ${params.path} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

interface QboRef {
  Id: string;
  DisplayName?: string;
}

/**
 * Finds a vendor or customer by display name, creating it if absent.
 *
 * A Bill needs a VendorRef and an Invoice needs a CustomerRef, so money
 * movement cannot sync without these existing. Names are escaped because they
 * are interpolated into a QBO query string.
 */
async function findOrCreate(
  tokens: TokenSet,
  entity: "Vendor" | "Customer",
  displayName: string,
  extra: Record<string, unknown> = {},
): Promise<QboRef> {
  const escaped = displayName.replace(/'/g, "\\'");
  const query = `select * from ${entity} where DisplayName = '${escaped}'`;

  const found = await qbo<{
    QueryResponse?: Record<string, QboRef[] | undefined>;
  }>({
    tokens,
    path: `query?query=${encodeURIComponent(query)}`,
  });

  const existing = found.QueryResponse?.[entity]?.[0];
  if (existing) return existing;

  const created = await qbo<Record<string, QboRef>>({
    tokens,
    path: entity.toLowerCase(),
    method: "POST",
    body: { DisplayName: displayName, ...extra },
  });
  return created[entity];
}

/** Client funds a milestone: money in. */
export async function recordFunding(params: {
  tokens: TokenSet;
  clientName: string;
  milestoneId: string;
  description: string;
  /** Milestone value in cents. */
  amountCents: number;
}) {
  const customer = await findOrCreate(params.tokens, "Customer", params.clientName);

  const invoice = await qbo<{ Invoice: { Id: string } }>({
    tokens: params.tokens,
    path: "invoice",
    method: "POST",
    body: {
      CustomerRef: { value: customer.Id },
      DocNumber: `ESC-${params.milestoneId}`.slice(0, 21),
      PrivateNote: params.description,
      Line: [
        {
          Amount: params.amountCents / 100,
          DetailType: "SalesItemLineDetail",
          Description: params.description,
          SalesItemLineDetail: {},
        },
      ],
    },
  });

  return { invoiceId: invoice.Invoice.Id, customerId: customer.Id };
}

/**
 * Milestone released to the payee: money out.
 *
 * `Vendor1099: true` is what makes QuickBooks include this vendor in its 1099
 * wizard. It is set only for payees the platform actually pays directly —
 * Stripe-rail payees are reported by Stripe, and flagging them here would
 * double-report.
 */
export async function recordRelease(params: {
  tokens: TokenSet;
  payeeName: string;
  milestoneId: string;
  description: string;
  /** Net paid to the payee in cents, after the platform fee. */
  netCents: number;
  /** True only when the platform is the payer of record for this payment. */
  is1099Eligible: boolean;
}) {
  const vendor = await findOrCreate(
    params.tokens,
    "Vendor",
    params.payeeName,
    params.is1099Eligible ? { Vendor1099: true } : {},
  );

  const bill = await qbo<{ Bill: { Id: string } }>({
    tokens: params.tokens,
    path: "bill",
    method: "POST",
    body: {
      VendorRef: { value: vendor.Id },
      DocNumber: `REL-${params.milestoneId}`.slice(0, 21),
      PrivateNote: params.description,
      Line: [
        {
          Amount: params.netCents / 100,
          DetailType: "AccountBasedExpenseLineDetail",
          Description: params.description,
          AccountBasedExpenseLineDetail: {
            AccountRef: process.env.QBO_CONTRACTOR_EXPENSE_ACCOUNT
              ? { value: process.env.QBO_CONTRACTOR_EXPENSE_ACCOUNT }
              : undefined,
          },
        },
      ],
    },
  });

  return { billId: bill.Bill.Id, vendorId: vendor.Id };
}

export async function getCompanyName(tokens: TokenSet): Promise<string> {
  const res = await qbo<{ CompanyInfo: { CompanyName: string } }>({
    tokens,
    path: `companyinfo/${tokens.realmId}`,
  });
  return res.CompanyInfo.CompanyName;
}

export type { TokenSet };
