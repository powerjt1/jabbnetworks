export type PaymentProvider = "stripe" | "paypal" | "plaid";

export type FundingMethod = "ach" | "card";

export type PayoutRail = "stripe" | "paypal";

/**
 * Escrow lifecycle for a single milestone. Money moves:
 *   unfunded -> funding -> funded -> released
 * A client can pull back only while funds are held, which is what
 * `refunded` covers.
 */
export type EscrowStatus =
  | "unfunded"
  | "funding"
  | "funded"
  | "releasing"
  | "released"
  | "refunded"
  | "failed";

export interface EscrowRecord {
  id: string;
  milestoneId: string;
  contractId: string;
  status: EscrowStatus;
  /** Milestone value in cents. */
  amount: number;
  fundingMethod: FundingMethod;
  payoutRail: PayoutRail;
  /** Stripe PaymentIntent that moved client money onto the platform. */
  paymentIntentId?: string;
  /** Stripe Transfer that moved money to the freelancer. */
  transferId?: string;
  /** PayPal Payouts batch, when the freelancer is paid that way. */
  payoutBatchId?: string;
  fundedAt?: string;
  releasedAt?: string;
  /** Present when status is "failed". Safe to show the client. */
  failureReason?: string;
}

export type ConnectStatus =
  | "not_started"
  | "onboarding"
  | "restricted"
  | "active";

export interface PayoutAccount {
  userId: string;
  rail: PayoutRail;
  status: ConnectStatus;
  /** Stripe Connect account id, when rail is "stripe". */
  stripeAccountId?: string;
  /** PayPal payout email, when rail is "paypal". */
  paypalEmail?: string;
  /** Whether Stripe has cleared the account to receive transfers. */
  payoutsEnabled: boolean;
  /** Requirements Stripe still needs before payouts turn on. */
  requirementsDue: string[];
}

export interface BankAccount {
  id: string;
  userId: string;
  /** Institution name from Plaid, e.g. "Chase". */
  institution: string;
  /** Last four of the account number. Never store the full number. */
  last4: string;
  accountType: "checking" | "savings";
  verified: boolean;
  linkedAt: string;
}

export interface Transaction {
  id: string;
  contractId: string;
  milestoneId?: string;
  kind: "funding" | "release" | "refund" | "fee";
  /** Cents. Positive is money in, negative is money out. */
  amount: number;
  /** Cents. Platform fee taken from this transaction. */
  fee: number;
  status: "pending" | "settled" | "failed";
  method: FundingMethod | PayoutRail;
  description: string;
  createdAt: string;
  settledAt?: string;
}
