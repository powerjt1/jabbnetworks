import type { FundingMethod, PayoutRail } from "./types";

/**
 * All amounts in this module are CENTS. Money never touches a float.
 *
 * Processor rates below are indicative US list pricing and are the numbers the
 * UI quotes to clients. Verify them against your own Stripe and PayPal
 * agreements before going live — negotiated rates and international cards
 * differ, and list pricing changes.
 */

/** Platform's cut, taken from the freelancer's side on release. */
export const PLATFORM_FEE_BPS = 800; // 8.00%

const CARD_BPS = 290; // 2.9%
const CARD_FIXED = 30; // $0.30
const ACH_BPS = 80; // 0.8%
const ACH_CAP = 500; // $5.00
const PAYPAL_PAYOUT_BPS = 200; // 2%
const PAYPAL_PAYOUT_CAP = 100; // $1.00 domestic

function bps(amount: number, rate: number) {
  return Math.round((amount * rate) / 10_000);
}

/** What the client pays on top of the milestone to fund it. */
export function fundingFee(amount: number, method: FundingMethod): number {
  if (method === "ach") {
    return Math.min(bps(amount, ACH_BPS), ACH_CAP);
  }
  return bps(amount, CARD_BPS) + CARD_FIXED;
}

/** What it costs to move money out to the freelancer. */
export function payoutFee(amount: number, rail: PayoutRail): number {
  if (rail === "paypal") {
    return Math.min(bps(amount, PAYPAL_PAYOUT_BPS), PAYPAL_PAYOUT_CAP);
  }
  // Stripe Connect payouts to a connected account carry no per-transfer fee
  // on standard US pricing; the cost sits in the original charge.
  return 0;
}

export function platformFee(amount: number): number {
  return bps(amount, PLATFORM_FEE_BPS);
}

export interface FeeBreakdown {
  /** Milestone value. */
  amount: number;
  /** Processing cost of funding, paid by the client. */
  fundingFee: number;
  /** Total the client is charged. */
  clientTotal: number;
  /** Platform's cut, deducted from the freelancer. */
  platformFee: number;
  /** Cost of moving money to the freelancer. */
  payoutFee: number;
  /** What actually lands in the freelancer's account. */
  freelancerNet: number;
}

export function breakdown(
  amount: number,
  method: FundingMethod,
  rail: PayoutRail,
): FeeBreakdown {
  const funding = fundingFee(amount, method);
  const platform = platformFee(amount);
  const payout = payoutFee(amount - platform, rail);
  return {
    amount,
    fundingFee: funding,
    clientTotal: amount + funding,
    platformFee: platform,
    payoutFee: payout,
    freelancerNet: amount - platform - payout,
  };
}

/**
 * What the client saves by funding with ACH instead of a card. On the
 * contract sizes this marketplace handles the gap is large enough that it
 * belongs in front of the client at the moment they choose, not buried in a
 * pricing page.
 */
export function achSaving(amount: number): number {
  return fundingFee(amount, "card") - fundingFee(amount, "ach");
}

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}
