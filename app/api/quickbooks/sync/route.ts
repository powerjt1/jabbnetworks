import { NextResponse } from "next/server";
import {
  isQuickBooksConfigured,
  recordFunding,
  recordRelease,
  refreshTokens,
  type TokenSet,
} from "@/lib/accounting/quickbooks";
import { platformFee } from "@/lib/payments/fees";

/**
 * Pushes milestone money movement into QuickBooks.
 *
 * Driven from escrow events rather than run on a timer, so the ledger reflects
 * what actually happened rather than a nightly guess. It must be idempotent:
 * the Stripe webhook that triggers it retries, and a duplicated Bill is a real
 * accounting error that someone has to unpick by hand. `DocNumber` is keyed to
 * the milestone, and the ledger row below is the guard.
 */
export async function POST(request: Request) {
  if (!isQuickBooksConfigured()) {
    return NextResponse.json(
      { error: "QuickBooks is not configured on this deployment." },
      { status: 503 },
    );
  }

  let body: {
    event?: "funded" | "released";
    milestoneId?: string;
    contractId?: string;
    /** Only meaningful for a release. */
    rail?: "stripe" | "paypal";
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { event, milestoneId, contractId, rail = "stripe" } = body;
  if (!event || !milestoneId || !contractId) {
    return NextResponse.json(
      { error: "event, milestoneId and contractId are required." },
      { status: 400 },
    );
  }

  if (await alreadySynced(milestoneId, event)) {
    return NextResponse.json({ synced: true, duplicate: true });
  }

  const context = await loadContext(contractId, milestoneId);
  if (!context) {
    return NextResponse.json({ error: "Milestone not found." }, { status: 404 });
  }

  const tokens = await loadTokens();
  if (!tokens) {
    return NextResponse.json(
      { error: "QuickBooks is not connected. Authorise it first." },
      { status: 409 },
    );
  }

  try {
    if (event === "funded") {
      const result = await recordFunding({
        tokens,
        clientName: context.clientName,
        milestoneId,
        description: `${context.jobTitle} — ${context.milestoneTitle}`,
        amountCents: context.amountCents,
      });
      await markSynced(milestoneId, event, result.invoiceId);
      return NextResponse.json({ synced: true, ...result });
    }

    const fee = platformFee(context.amountCents);
    const result = await recordRelease({
      tokens,
      payeeName: context.payeeName,
      milestoneId,
      description: `${context.jobTitle} — ${context.milestoneTitle}`,
      netCents: context.amountCents - fee,
      // Stripe files 1099s for its own rail. Flagging those vendors as
      // 1099-eligible here would report the same money twice.
      is1099Eligible: rail !== "stripe",
    });
    await markSynced(milestoneId, event, result.billId);
    return NextResponse.json({ synced: true, platformFee: fee, ...result });
  } catch (error) {
    console.error("QuickBooks sync failed", error);
    return NextResponse.json({ error: "Sync failed." }, { status: 502 });
  }
}

/* ---------------------------------------------------------------------------
 * Persistence seams.
 * ------------------------------------------------------------------------ */

const synced = new Set<string>();

async function alreadySynced(milestoneId: string, event: string) {
  return synced.has(`${milestoneId}:${event}`);
}

async function markSynced(
  milestoneId: string,
  event: string,
  documentId: string,
) {
  // INSERT INTO accounting_sync_log (milestone_id, event, qbo_document_id)
  // with a unique constraint on (milestone_id, event) — that constraint is
  // what actually prevents a duplicate Bill under concurrent retries.
  synced.add(`${milestoneId}:${event}`);
  console.info("Synced to QuickBooks", { milestoneId, event, documentId });
}

/**
 * Loads and refreshes the stored token set. Intuit rotates the refresh token
 * on each use, so a real implementation persists the rotated one here.
 */
async function loadTokens(): Promise<TokenSet | null> {
  const refreshToken = process.env.QBO_REFRESH_TOKEN;
  const realmId = process.env.QBO_REALM_ID;
  if (!refreshToken || !realmId) return null;
  const tokens = await refreshTokens(refreshToken, realmId);
  // UPDATE accounting_connections SET refresh_token = tokens.refreshToken
  return tokens;
}

async function loadContext(contractId: string, milestoneId: string) {
  const { getContract, getJob, getUser, getAgency } = await import("@/lib/data");
  const contract = getContract(contractId);
  const milestone = contract?.milestones.find((m) => m.id === milestoneId);
  if (!contract || !milestone) return null;

  const job = getJob(contract.jobId);
  const client = getUser(contract.clientId);
  const agency = contract.agencyId ? getAgency(contract.agencyId) : undefined;
  const freelancer = getUser(contract.freelancerId);

  return {
    clientName: client?.company ?? client?.name ?? "Unknown client",
    payeeName: agency?.name ?? freelancer?.name ?? "Unknown payee",
    jobTitle: job?.title ?? "Contract",
    milestoneTitle: milestone.title,
    amountCents: Math.round(milestone.amount * 100),
  };
}
