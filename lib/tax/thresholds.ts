import type { ComplianceState, PayeeYearToDate, TaxForm } from "./types";

/**
 * 1099-NEC reporting threshold, in cents, per payee per calendar year.
 *
 * This number moves with legislation and has recently done so: it sat at $600
 * for decades, and the July 2025 reconciliation act raised it to $2,000 for
 * payments made after 31 December 2025, indexed for inflation thereafter.
 *
 * It is a named constant rather than a literal scattered through the codebase
 * precisely because it changes. Confirm the figure for the filing year with
 * your accountant before relying on it — nothing here is tax advice, and the
 * penalty for under-reporting lands on you, not on this code.
 */
export const REPORTING_THRESHOLD_CENTS = 200_000;

/** Warn once a payee reaches this share of the threshold. */
const APPROACHING_RATIO = 0.75;

/**
 * Backup withholding rate applied when a payee has no valid TIN on file.
 *
 * Withholding is a decision with real consequences for the payee, so this
 * module only reports that it *would* apply. Actually withholding from a
 * payment is deliberately not automated here.
 */
export const BACKUP_WITHHOLDING_BPS = 2400; // 24%

export function isFormUsable(form?: TaxForm): boolean {
  if (!form) return false;
  if (form.status !== "submitted" && form.status !== "verified") return false;
  if (form.expiresAt && new Date(form.expiresAt) < new Date()) return false;
  return true;
}

/**
 * Where a payee stands for the year.
 *
 * Only payments Stripe did not report count toward the threshold: Stripe files
 * its own 1099s for Stripe-rail money, and counting it here would double-report
 * the payee.
 */
export function complianceState(params: {
  ytd: PayeeYearToDate;
  form?: TaxForm;
  usesNonStripeRail: boolean;
}): ComplianceState {
  const { ytd, form, usesNonStripeRail } = params;

  if (!usesNonStripeRail) return "not_required";

  const usable = isFormUsable(form);
  const crossed = ytd.reportableCents >= REPORTING_THRESHOLD_CENTS;

  if (crossed && !usable) {
    return form?.status === "invalid"
      ? "form_invalid"
      : "threshold_crossed_no_form";
  }
  if (!usable) {
    return form?.status === "invalid" ? "form_invalid" : "form_missing";
  }
  if (
    !crossed &&
    ytd.reportableCents >= REPORTING_THRESHOLD_CENTS * APPROACHING_RATIO
  ) {
    return "threshold_approaching";
  }
  return "ok";
}

export function remainingToThreshold(ytd: PayeeYearToDate): number {
  return Math.max(0, REPORTING_THRESHOLD_CENTS - ytd.reportableCents);
}

export function backupWithholding(amountCents: number): number {
  return Math.round((amountCents * BACKUP_WITHHOLDING_BPS) / 10_000);
}

/** 1099-NECs are due to the recipient and the IRS by 31 January. */
export function filingDeadline(taxYear: number): Date {
  return new Date(Date.UTC(taxYear + 1, 0, 31));
}

export const STATE_LABEL: Record<ComplianceState, string> = {
  not_required: "Not required",
  ok: "Compliant",
  form_missing: "W-9 missing",
  form_invalid: "W-9 invalid",
  threshold_approaching: "Approaching threshold",
  threshold_crossed_no_form: "Reportable — no W-9",
};

export const STATE_TONE: Record<
  ComplianceState,
  "neutral" | "positive" | "caution" | "danger"
> = {
  not_required: "neutral",
  ok: "positive",
  form_missing: "caution",
  form_invalid: "danger",
  threshold_approaching: "caution",
  threshold_crossed_no_form: "danger",
};
