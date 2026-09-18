/**
 * SERVER ONLY.
 *
 * PayPal is the alternative payout rail, for freelancers outside Stripe
 * Connect's supported countries or who simply prefer it. Funding still runs
 * through Stripe — mixing funding rails would mean two escrow ledgers to
 * reconcile, and that is not worth the flexibility.
 *
 * Uses the REST API directly rather than a vendored SDK: Payouts is two
 * endpoints, and a dependency that wraps them earns less than it costs.
 */

const LIVE = "https://api-m.paypal.com";
const SANDBOX = "https://api-m.sandbox.paypal.com";

function baseUrl() {
  return process.env.PAYPAL_ENV === "live" ? LIVE : SANDBOX;
}

export function isPayPalConfigured() {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET,
  );
}

async function accessToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error(
      "PayPal is not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env.local.",
    );
  }

  const res = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Sends a single payout. `senderItemId` must be stable per milestone — PayPal
 * uses it to reject duplicates, which is what stops a double-click or a retried
 * webhook from paying a freelancer twice.
 */
export async function sendPayout(params: {
  recipientEmail: string;
  /** Cents. */
  amount: number;
  senderItemId: string;
  note: string;
}) {
  const token = await accessToken();

  const res = await fetch(`${baseUrl()}/v1/payments/payouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: `batch_${params.senderItemId}`,
        email_subject: "You have a payment from JABB Networks",
        email_message: params.note,
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: (params.amount / 100).toFixed(2),
            currency: "USD",
          },
          receiver: params.recipientEmail,
          note: params.note,
          sender_item_id: params.senderItemId,
        },
      ],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PayPal payout failed: ${res.status} ${body}`);
  }

  const data = (await res.json()) as {
    batch_header: { payout_batch_id: string; batch_status: string };
  };
  return {
    batchId: data.batch_header.payout_batch_id,
    status: data.batch_header.batch_status,
  };
}

export async function getPayoutStatus(batchId: string) {
  const token = await accessToken();
  const res = await fetch(`${baseUrl()}/v1/payments/payouts/${batchId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal lookup failed: ${res.status}`);

  const data = (await res.json()) as {
    batch_header: { batch_status: string };
  };
  return { status: data.batch_header.batch_status };
}
