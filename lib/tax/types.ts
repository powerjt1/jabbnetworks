/**
 * US contractor tax compliance.
 *
 * Scope note: Stripe Connect Express already collects tax details and files
 * 1099-NECs for money that moves through Stripe. Everything in this module
 * exists because the PayPal payout rail bypasses Stripe entirely — Stripe
 * cannot report payments it never saw, so those need their own W-9 on file and
 * their own year-to-date tracking.
 *
 * Freelancers paid only through Stripe do not need any of this.
 */

export type TaxFormType = "w9" | "w8ben" | "w8ben_e";

/** Boxes 3a/3b on the current W-9. */
export type TaxClassification =
  | "individual"
  | "c_corp"
  | "s_corp"
  | "partnership"
  | "trust_estate"
  | "llc_c"
  | "llc_s"
  | "llc_p"
  | "other";

export type TaxFormStatus =
  | "not_requested"
  | "requested"
  | "submitted"
  | "verified"
  | "invalid"
  | "expired";

export interface TaxForm {
  id: string;
  /** Freelancer or agency this form belongs to. */
  payeeId: string;
  payeeKind: "user" | "agency";
  formType: TaxFormType;
  status: TaxFormStatus;
  legalName: string;
  businessName?: string;
  classification: TaxClassification;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  /**
   * Last four digits only. The full TIN is never stored by this application —
   * see lib/tax/README for the storage rules and why.
   */
  tinLast4: string;
  tinType: "ssn" | "ein";
  /** Set when the payee has certified the form. */
  certifiedAt?: string;
  submittedAt?: string;
  verifiedAt?: string;
  /** Populated when the IRS TIN match fails. */
  invalidReason?: string;
  /** W-8 forms expire; W-9s do not, but a changed address invalidates one. */
  expiresAt?: string;
}

export interface PayeeYearToDate {
  payeeId: string;
  payeeKind: "user" | "agency";
  taxYear: number;
  /** Cents paid through rails Stripe does not report on. */
  reportableCents: number;
  /** Cents paid through Stripe, which Stripe reports itself. */
  stripeReportedCents: number;
  /** Cents withheld under backup withholding, if it applied. */
  withheldCents: number;
}

export type ComplianceState =
  | "not_required"
  | "ok"
  | "form_missing"
  | "form_invalid"
  | "threshold_approaching"
  | "threshold_crossed_no_form";

export interface ComplianceRow {
  payeeId: string;
  payeeKind: "user" | "agency";
  name: string;
  state: ComplianceState;
  reportableCents: number;
  form?: TaxForm;
  /** True when this payee has ever been paid outside Stripe. */
  usesNonStripeRail: boolean;
}
