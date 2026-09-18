import { platformFee } from "@/lib/payments/fees";
import {
  isQuickBooksConfigured,
  recordFunding,
  recordRelease,
  refreshTokens,
  type TokenSet,
} from "./quickbooks";
import { dequeue, due, enqueue } from "./queue";

/**
 * Posts one milestone event to QuickBooks.
 *
 * Never throws. Callers are webhook handlers whose job is recording money
 * movement, and a bookkeeping failure must not take that down — see
 * lib/accounting/queue.ts for why. A failure here is queued and retried.
 */
export async function syncMilestone(params: {
  milestoneId: string;
  contractId: string;
  event: "funded" | "released";
  rail?: "stripe" | "paypal";
}): Promise<{ synced: boolean; reason?: string }> {
  const rail = params.rail ?? "stripe";

  if (!isQuickBooksConfigured()) {
    // Not an error. Most deployments will not have QuickBooks connected, and
    // queueing retries against an integration that does not exist would fill
    // the queue with work that can never succeed.
    return { synced: false, reason: "not_configured" };
  }

  if (await alreadySynced(params.milestoneId, params.event)) {
    return { synced: true, reason: "duplicate" };
  }

  try {
    const tokens = await loadTokens();
    if (!tokens) {
      return { synced: false, reason: "not_connected" };
    }

    const context = await loadContext(params.contractId, params.milestoneId);
    if (!context) {
      // A milestone that does not exist will not start existing on retry.
      return { synced: false, reason: "not_found" };
    }

    if (params.event === "funded") {
      const result = await recordFunding({
        tokens,
        clientName: context.clientName,
        milestoneId: params.milestoneId,
        description: context.description,
        amountCents: context.amountCents,
      });
      await markSynced(params.milestoneId, params.event, result.invoiceId);
    } else {
      const fee = platformFee(context.amountCents);
      const result = await recordRelease({
        tokens,
        payeeName: context.payeeName,
        milestoneId: params.milestoneId,
        description: context.description,
        netCents: context.amountCents - fee,
        is1099Eligible: rail !== "stripe",
      });
      await markSynced(params.milestoneId, params.event, result.billId);
    }

    dequeue(params.milestoneId, params.event);
    return { synced: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown";
    console.error("QuickBooks sync failed, queued for retry", {
      milestoneId: params.milestoneId,
      event: params.event,
      reason,
    });
    enqueue({
      milestoneId: params.milestoneId,
      contractId: params.contractId,
      event: params.event,
      rail,
      error: reason,
    });
    return { synced: false, reason };
  }
}

/** Works through whatever is due. Call from a cron route or a worker. */
export async function drainQueue() {
  const items = due();
  const results = await Promise.all(
    items.map((item) =>
      syncMilestone({
        milestoneId: item.milestoneId,
        contractId: item.contractId,
        event: item.event,
        rail: item.rail,
      }),
    ),
  );
  return {
    attempted: items.length,
    succeeded: results.filter((r) => r.synced).length,
  };
}

/* ------------------------------------------------------------------------ */

const syncedKeys = new Set<string>();

async function alreadySynced(milestoneId: string, event: string) {
  return syncedKeys.has(`${milestoneId}:${event}`);
}

async function markSynced(
  milestoneId: string,
  event: string,
  documentId: string,
) {
  // INSERT INTO accounting_sync_log ... — the unique constraint on
  // (milestone_id, event, provider) is what makes concurrent retries safe.
  syncedKeys.add(`${milestoneId}:${event}`);
  console.info("Synced to QuickBooks", { milestoneId, event, documentId });
}

async function loadTokens(): Promise<TokenSet | null> {
  const refreshToken = process.env.QBO_REFRESH_TOKEN;
  const realmId = process.env.QBO_REALM_ID;
  if (!refreshToken || !realmId) return null;
  return refreshTokens(refreshToken, realmId);
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
    description: `${job?.title ?? "Contract"} — ${milestone.title}`,
    amountCents: Math.round(milestone.amount * 100),
  };
}
