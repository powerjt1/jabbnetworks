import { NextResponse } from "next/server";
import type { TaxClassification } from "@/lib/tax/types";

/**
 * Accepts a submitted W-9.
 *
 * Read lib/tax/README.md before changing anything here. The short version: the
 * full TIN is forwarded to the verification provider and is never written to
 * the database, a log, an error message or a response. `tinLast4` is all that
 * survives this function, and that is deliberate rather than unfinished.
 */

const CLASSIFICATIONS: TaxClassification[] = [
  "individual",
  "c_corp",
  "s_corp",
  "partnership",
  "trust_estate",
  "llc_c",
  "llc_s",
  "llc_p",
  "other",
];

function isValidTin(tin: string, type: "ssn" | "ein") {
  const digits = tin.replace(/\D/g, "");
  if (digits.length !== 9) return false;
  // Structural rejects the IRS will never issue.
  if (/^(\d)\1{8}$/.test(digits)) return false;
  if (type === "ssn") {
    const area = digits.slice(0, 3);
    if (area === "000" || area === "666" || Number(area) >= 900) return false;
    if (digits.slice(3, 5) === "00") return false;
    if (digits.slice(5) === "0000") return false;
  }
  return true;
}

export async function POST(request: Request) {
  let body: {
    payeeId?: string;
    legalName?: string;
    businessName?: string;
    classification?: string;
    tin?: string;
    tinType?: "ssn" | "ein";
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
    certified?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    payeeId,
    legalName,
    classification,
    tin,
    tinType = "ssn",
    address,
    certified,
  } = body;

  if (!payeeId || !legalName || !tin || !address?.line1 || !address?.postalCode) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 },
    );
  }

  if (!classification || !CLASSIFICATIONS.includes(classification as TaxClassification)) {
    return NextResponse.json(
      { error: "Invalid tax classification." },
      { status: 400 },
    );
  }

  // A W-9 without certification is not a W-9; it is an unsigned form.
  if (!certified) {
    return NextResponse.json(
      { error: "The certification must be signed." },
      { status: 400 },
    );
  }

  if (!isValidTin(tin, tinType)) {
    // No echo of the submitted value, not even partially, in the error.
    return NextResponse.json(
      { error: "That does not look like a valid TIN." },
      { status: 400 },
    );
  }

  const tinLast4 = tin.replace(/\D/g, "").slice(-4);

  try {
    // Forward the full TIN to the verification provider — Stripe Tax,
    // Track1099, Tax1009 or Intuit — and keep only what comes back.
    // The value must not be logged, cached or persisted on the way through.
    const verification = await submitForVerification({
      legalName,
      tin,
      tinType,
    });

    await persistForm({
      payeeId,
      legalName,
      businessName: body.businessName,
      classification: classification as TaxClassification,
      address,
      tinLast4,
      tinType,
      status: verification.status,
    });

    return NextResponse.json({
      status: verification.status,
      // Everything the browser is ever told about the number.
      tinLast4,
    });
  } catch (error) {
    // Log the failure, never the payload.
    console.error("W-9 submission failed", {
      payeeId,
      reason: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json(
      { error: "Could not submit the form." },
      { status: 502 },
    );
  }
}

/**
 * Seam for the TIN-matching provider. Returns "submitted" until one is wired;
 * IRS TIN matching is asynchronous in practice, so "verified" normally arrives
 * later via a webhook rather than inline.
 */
async function submitForVerification(_params: {
  legalName: string;
  tin: string;
  tinType: "ssn" | "ein";
}): Promise<{ status: "submitted" | "verified" | "invalid" }> {
  return { status: "submitted" };
}

/** Writes everything except the TIN. */
async function persistForm(form: {
  payeeId: string;
  legalName: string;
  businessName?: string;
  classification: TaxClassification;
  address: Record<string, string | undefined>;
  tinLast4: string;
  tinType: "ssn" | "ein";
  status: string;
}) {
  // INSERT INTO tax_forms (...) — note the absence of a tin column.
  console.info("W-9 recorded", {
    payeeId: form.payeeId,
    status: form.status,
    tinLast4: form.tinLast4,
  });
}
