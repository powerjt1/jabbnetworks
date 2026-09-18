import Stripe from "stripe";
import { platformFee } from "./fees";
import type { FundingMethod } from "./types";

/**
 * SERVER ONLY. Never import this from a client component — it reads the
 * secret key.
 *
 * Escrow uses Stripe's *separate charges and transfers* model rather than
 * destination charges. The client's payment lands in the platform balance and
 * stays there until the milestone is approved, which is the whole point of
 * escrow: with a destination charge the money would reach the freelancer
 * immediately and there would be nothing to hold.
 *
 * Every charge and its matching transfer share a `transfer_group` keyed to the
 * milestone, so the ledger reconciles per milestone rather than per contract.
 */

let client: Stripe | null = null;

export function stripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) client = new Stripe(key);
  return client;
}

export function requireStripe(): Stripe {
  const s = stripe();
  if (!s) {
    throw new Error(
      "Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local.",
    );
  }
  return s;
}

export function transferGroup(milestoneId: string) {
  return `milestone_${milestoneId}`;
}

/**
 * Creates the freelancer's Connect account. Express means Stripe collects
 * their identity documents and tax details and files their 1099 — the
 * platform never holds that data, which is the point.
 */
export async function createConnectAccount(params: {
  email: string;
  country?: string;
}) {
  const s = requireStripe();
  return s.accounts.create({
    type: "express",
    email: params.email,
    country: params.country ?? "US",
    capabilities: {
      transfers: { requested: true },
    },
    business_type: "individual",
  });
}

export async function createOnboardingLink(params: {
  accountId: string;
  returnUrl: string;
  refreshUrl: string;
}) {
  const s = requireStripe();
  return s.accountLinks.create({
    account: params.accountId,
    type: "account_onboarding",
    return_url: params.returnUrl,
    refresh_url: params.refreshUrl,
  });
}

/** Funds a milestone. The money lands in the platform balance and waits. */
export async function fundMilestone(params: {
  milestoneId: string;
  contractId: string;
  /** Milestone value in cents. */
  amount: number;
  /** Processing cost, added on top and paid by the client. */
  fee: number;
  method: FundingMethod;
  customerId?: string;
  /** Plaid processor token, for instantly-verified ACH debits. */
  bankToken?: string;
}) {
  const s = requireStripe();

  const paymentMethodTypes: Stripe.PaymentIntentCreateParams["payment_method_types"] =
    params.method === "ach" ? ["us_bank_account"] : ["card"];

  return s.paymentIntents.create({
    amount: params.amount + params.fee,
    currency: "usd",
    payment_method_types: paymentMethodTypes,
    customer: params.customerId,
    transfer_group: transferGroup(params.milestoneId),
    metadata: {
      milestone_id: params.milestoneId,
      contract_id: params.contractId,
      escrow_amount: String(params.amount),
    },
    description: `Escrow funding for milestone ${params.milestoneId}`,
  });
}

/**
 * Releases held funds to the freelancer, less the platform fee. Called only
 * after the client approves the milestone.
 */
export async function releaseMilestone(params: {
  milestoneId: string;
  /** Milestone value in cents, as escrowed. */
  amount: number;
  destinationAccountId: string;
}) {
  const s = requireStripe();
  const fee = platformFee(params.amount);

  return s.transfers.create({
    amount: params.amount - fee,
    currency: "usd",
    destination: params.destinationAccountId,
    transfer_group: transferGroup(params.milestoneId),
    metadata: {
      milestone_id: params.milestoneId,
      platform_fee: String(fee),
    },
    description: `Milestone ${params.milestoneId} released`,
  });
}

/** Returns escrowed funds to the client. Only valid while funds are held. */
export async function refundMilestone(params: {
  paymentIntentId: string;
  reason?: string;
}) {
  const s = requireStripe();
  return s.refunds.create({
    payment_intent: params.paymentIntentId,
    metadata: params.reason ? { reason: params.reason } : undefined,
  });
}

/**
 * Turns a Plaid processor token into a reusable Stripe payment method, so the
 * client links their bank once and funds every later milestone from it.
 */
export async function attachBankAccount(params: {
  customerId: string;
  processorToken: string;
}) {
  const s = requireStripe();
  return s.customers.createSource(params.customerId, {
    source: params.processorToken,
  });
}

export async function getAccountStatus(accountId: string) {
  const s = requireStripe();
  const account = await s.accounts.retrieve(accountId);
  return {
    payoutsEnabled: account.payouts_enabled ?? false,
    chargesEnabled: account.charges_enabled ?? false,
    requirementsDue: account.requirements?.currently_due ?? [],
  };
}
