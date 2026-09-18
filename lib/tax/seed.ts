import type { PayeeYearToDate, TaxForm } from "./types";

/**
 * Cents throughout.
 *
 * The spread here is deliberate: it shows every compliance state the dashboard
 * has to render, including the one that matters — a payee who has crossed the
 * reporting threshold on the PayPal rail with no W-9 on file.
 */

export const TAX_YEAR = 2026;

export const TAX_FORMS: TaxForm[] = [
  {
    id: "w9_1",
    payeeId: "u_free_4",
    payeeKind: "user",
    formType: "w9",
    status: "verified",
    legalName: "Elena Vasquez",
    classification: "individual",
    address: {
      line1: "Calle de Alcalá 42",
      city: "Madrid",
      state: "MD",
      postalCode: "28014",
      country: "ES",
    },
    tinLast4: "4182",
    tinType: "ssn",
    certifiedAt: "2026-02-11T10:00:00Z",
    submittedAt: "2026-02-11T10:00:00Z",
    verifiedAt: "2026-02-13T08:30:00Z",
  },
  {
    id: "w9_2",
    payeeId: "u_free_3",
    payeeKind: "user",
    formType: "w9",
    status: "submitted",
    legalName: "Arjun Mehta",
    businessName: "Third Signal",
    classification: "llc_s",
    address: {
      line1: "14 Residency Road",
      city: "Bengaluru",
      state: "KA",
      postalCode: "560025",
      country: "IN",
    },
    tinLast4: "7731",
    tinType: "ein",
    certifiedAt: "2026-08-02T14:20:00Z",
    submittedAt: "2026-08-02T14:20:00Z",
  },
  {
    id: "w9_3",
    payeeId: "u_free_2",
    payeeKind: "user",
    formType: "w9",
    status: "invalid",
    legalName: "Sofia Lindqvist",
    classification: "individual",
    address: {
      line1: "Sveavägen 31",
      city: "Stockholm",
      state: "AB",
      postalCode: "11134",
      country: "SE",
    },
    tinLast4: "0042",
    tinType: "ssn",
    certifiedAt: "2026-05-19T09:10:00Z",
    submittedAt: "2026-05-19T09:10:00Z",
    invalidReason:
      "IRS TIN matching returned a name/number mismatch. The payee needs to resubmit.",
  },
];

export const YEAR_TO_DATE: PayeeYearToDate[] = [
  {
    // Paid entirely through Stripe Connect — Stripe files this one.
    payeeId: "u_you",
    payeeKind: "user",
    taxYear: TAX_YEAR,
    reportableCents: 0,
    stripeReportedCents: 2_550_000,
    withheldCents: 0,
  },
  {
    // Crossed the threshold on the PayPal rail with no usable W-9.
    payeeId: "u_free_2",
    payeeKind: "user",
    taxYear: TAX_YEAR,
    reportableCents: 740_000,
    stripeReportedCents: 0,
    withheldCents: 0,
  },
  {
    payeeId: "u_free_3",
    payeeKind: "user",
    taxYear: TAX_YEAR,
    reportableCents: 168_000,
    stripeReportedCents: 410_000,
    withheldCents: 0,
  },
  {
    payeeId: "u_free_4",
    payeeKind: "user",
    taxYear: TAX_YEAR,
    reportableCents: 425_000,
    stripeReportedCents: 0,
    withheldCents: 0,
  },
];

/** Payees who have ever been paid outside Stripe, and so need a form on file. */
export const NON_STRIPE_PAYEES = new Set([
  "u_free_2",
  "u_free_3",
  "u_free_4",
]);

export function getTaxForm(payeeId: string) {
  return TAX_FORMS.find((f) => f.payeeId === payeeId);
}

export function getYearToDate(payeeId: string): PayeeYearToDate {
  return (
    YEAR_TO_DATE.find((y) => y.payeeId === payeeId) ?? {
      payeeId,
      payeeKind: "user",
      taxYear: TAX_YEAR,
      reportableCents: 0,
      stripeReportedCents: 0,
      withheldCents: 0,
    }
  );
}

/** One row per payee the platform has paid this year. */
export function getComplianceRows() {
  return YEAR_TO_DATE.map((ytd) => ({
    ytd,
    form: getTaxForm(ytd.payeeId),
    usesNonStripeRail: NON_STRIPE_PAYEES.has(ytd.payeeId),
  }));
}

/** Demo sync log for the accounting page. */
export const QBO_SYNC_LOG = [
  {
    id: "sl_1",
    milestoneId: "cm_5",
    event: "funded" as const,
    document: "Invoice ESC-cm_5",
    amountCents: 1_700_000,
    syncedAt: "2026-09-12T08:31:00Z",
  },
  {
    id: "sl_2",
    milestoneId: "cm_2",
    event: "funded" as const,
    document: "Invoice ESC-cm_2",
    amountCents: 1_300_000,
    syncedAt: "2026-09-08T09:16:00Z",
  },
  {
    id: "sl_3",
    milestoneId: "cm_1",
    event: "released" as const,
    document: "Bill REL-cm_1",
    amountCents: 460_000,
    syncedAt: "2026-09-06T14:21:00Z",
  },
  {
    id: "sl_4",
    milestoneId: "cm_4",
    event: "released" as const,
    document: "Bill REL-cm_4",
    amountCents: 552_000,
    syncedAt: "2026-08-30T16:46:00Z",
  },
];
