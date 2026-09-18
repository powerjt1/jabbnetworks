import {
  Configuration,
  CountryCode,
  PlaidApi,
  PlaidEnvironments,
  Products,
} from "plaid";

/**
 * SERVER ONLY.
 *
 * Plaid does two jobs here. It verifies a client's bank account instantly, so
 * ACH funding can start the same day instead of waiting on micro-deposits, and
 * it hands Stripe a processor token so the raw account and routing numbers
 * never touch this application.
 */

let client: PlaidApi | null = null;

export function plaid(): PlaidApi | null {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  if (!clientId || !secret) return null;

  if (!client) {
    const env = (process.env.NEXT_PUBLIC_PLAID_ENV ??
      "sandbox") as keyof typeof PlaidEnvironments;
    client = new PlaidApi(
      new Configuration({
        basePath: PlaidEnvironments[env],
        baseOptions: {
          headers: {
            "PLAID-CLIENT-ID": clientId,
            "PLAID-SECRET": secret,
          },
        },
      }),
    );
  }
  return client;
}

export function requirePlaid(): PlaidApi {
  const p = plaid();
  if (!p) {
    throw new Error(
      "Plaid is not configured. Set PLAID_CLIENT_ID and PLAID_SECRET in .env.local.",
    );
  }
  return p;
}

/** Short-lived token the browser uses to open Plaid Link. */
export async function createLinkToken(userId: string) {
  const p = requirePlaid();
  const res = await p.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: "JABB Networks",
    products: [Products.Auth],
    country_codes: [CountryCode.Us],
    language: "en",
  });
  return res.data;
}

/**
 * Exchanges the public token Link returns for a Stripe processor token. The
 * access token is used once and not persisted: this application has no reason
 * to hold standing access to a client's bank.
 */
export async function exchangeForStripeToken(params: {
  publicToken: string;
  accountId: string;
}) {
  const p = requirePlaid();

  const exchange = await p.itemPublicTokenExchange({
    public_token: params.publicToken,
  });

  const processor = await p.processorStripeBankAccountTokenCreate({
    access_token: exchange.data.access_token,
    account_id: params.accountId,
  });

  return { processorToken: processor.data.stripe_bank_account_token };
}

/** Institution name and last four, for display. Nothing more is stored. */
export async function getAccountSummary(accessToken: string) {
  const p = requirePlaid();
  const res = await p.accountsGet({ access_token: accessToken });
  const account = res.data.accounts[0];
  return {
    institution: res.data.item.institution_id ?? "Bank",
    last4: account?.mask ?? "0000",
    accountType: account?.subtype === "savings" ? "savings" : "checking",
  } as const;
}
