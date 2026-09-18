import type {
  BankAccount,
  EscrowRecord,
  PayoutAccount,
  Transaction,
} from "./types";

/** Cents throughout, matching lib/payments/fees.ts. */

export const PAYOUT_ACCOUNT: PayoutAccount = {
  userId: "u_you",
  rail: "stripe",
  status: "active",
  stripeAccountId: "acct_demo_1JabbNetworks",
  payoutsEnabled: true,
  requirementsDue: [],
};

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "ba_1",
    userId: "u_you",
    institution: "Chase",
    last4: "4417",
    accountType: "checking",
    verified: true,
    linkedAt: "2026-07-02T00:00:00Z",
  },
];

export const ESCROWS: EscrowRecord[] = [
  {
    id: "esc_1",
    milestoneId: "cm_1",
    contractId: "c_1",
    status: "released",
    amount: 500_000,
    fundingMethod: "ach",
    payoutRail: "stripe",
    paymentIntentId: "pi_demo_cm1",
    transferId: "tr_demo_cm1",
    fundedAt: "2026-08-04T10:00:00Z",
    releasedAt: "2026-09-06T14:20:00Z",
  },
  {
    id: "esc_2",
    milestoneId: "cm_2",
    contractId: "c_1",
    status: "funded",
    amount: 1_300_000,
    fundingMethod: "ach",
    payoutRail: "stripe",
    paymentIntentId: "pi_demo_cm2",
    fundedAt: "2026-09-08T09:15:00Z",
  },
  {
    id: "esc_3",
    milestoneId: "cm_3",
    contractId: "c_1",
    status: "unfunded",
    amount: 500_000,
    fundingMethod: "ach",
    payoutRail: "stripe",
  },
  {
    id: "esc_4",
    milestoneId: "cm_4",
    contractId: "c_2",
    status: "released",
    amount: 600_000,
    fundingMethod: "ach",
    payoutRail: "stripe",
    paymentIntentId: "pi_demo_cm4",
    transferId: "tr_demo_cm4",
    fundedAt: "2026-07-21T11:00:00Z",
    releasedAt: "2026-08-30T16:45:00Z",
  },
  {
    id: "esc_5",
    milestoneId: "cm_5",
    contractId: "c_2",
    status: "funded",
    amount: 1_700_000,
    fundingMethod: "ach",
    payoutRail: "stripe",
    paymentIntentId: "pi_demo_cm5",
    fundedAt: "2026-09-12T08:30:00Z",
  },
  {
    id: "esc_6",
    milestoneId: "cm_6",
    contractId: "c_2",
    status: "unfunded",
    amount: 600_000,
    fundingMethod: "ach",
    payoutRail: "stripe",
  },
];

export const TRANSACTIONS: Transaction[] = [
  {
    id: "tx_1",
    contractId: "c_1",
    milestoneId: "cm_2",
    kind: "funding",
    amount: 1_300_000,
    fee: 500,
    status: "settled",
    method: "ach",
    description: "Calder Health Group funded App build",
    createdAt: "2026-09-08T09:15:00Z",
    settledAt: "2026-09-10T06:00:00Z",
  },
  {
    id: "tx_2",
    contractId: "c_2",
    milestoneId: "cm_5",
    kind: "funding",
    amount: 1_700_000,
    fee: 500,
    status: "settled",
    method: "ach",
    description: "Meridian Financial funded Build & validation",
    createdAt: "2026-09-12T08:30:00Z",
    settledAt: "2026-09-15T06:00:00Z",
  },
  {
    id: "tx_3",
    contractId: "c_1",
    milestoneId: "cm_1",
    kind: "release",
    amount: -460_000,
    fee: 40_000,
    status: "settled",
    method: "stripe",
    description: "Design & data model released",
    createdAt: "2026-09-06T14:20:00Z",
    settledAt: "2026-09-08T06:00:00Z",
  },
  {
    id: "tx_4",
    contractId: "c_2",
    milestoneId: "cm_4",
    kind: "release",
    amount: -552_000,
    fee: 48_000,
    status: "settled",
    method: "stripe",
    description: "Proof of concept released",
    createdAt: "2026-08-30T16:45:00Z",
    settledAt: "2026-09-01T06:00:00Z",
  },
  {
    id: "tx_5",
    contractId: "c_3",
    milestoneId: "cm_7",
    kind: "release",
    amount: -1_334_000,
    fee: 116_000,
    status: "settled",
    method: "stripe",
    description: "Discovery sprint released",
    createdAt: "2026-05-29T12:00:00Z",
    settledAt: "2026-06-01T06:00:00Z",
  },
];

export function getEscrow(milestoneId: string) {
  return ESCROWS.find((e) => e.milestoneId === milestoneId);
}

export function getEscrowsForContract(contractId: string) {
  return ESCROWS.filter((e) => e.contractId === contractId);
}

export function getTransactions() {
  return [...TRANSACTIONS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
