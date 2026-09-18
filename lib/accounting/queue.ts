/**
 * Accounting sync is downstream of money movement, not part of it.
 *
 * This distinction decides the error handling. When a Stripe webhook arrives
 * saying a milestone was funded, two things need to happen: the escrow row
 * flips to `funded`, and QuickBooks gets an Invoice. The first is the system of
 * record. The second is bookkeeping.
 *
 * If QuickBooks is unreachable and we let that fail the webhook, Stripe retries
 * the whole event — and now the escrow transition runs again. Idempotency
 * should absorb that, but it means an outage at Intuit starts replaying
 * payment events, which is a bad trade for a bookkeeping entry that could just
 * as well be written ten minutes later.
 *
 * So a sync failure is captured here and retried on its own schedule. The
 * webhook still returns 200, because the thing Stripe actually cares about —
 * did you record the payment — did succeed.
 */

export interface PendingSync {
  milestoneId: string;
  contractId: string;
  event: "funded" | "released";
  rail: "stripe" | "paypal";
  attempts: number;
  lastError?: string;
  queuedAt: string;
  /** Unix ms; null once it has exhausted its attempts. */
  nextAttemptAt: number | null;
}

const MAX_ATTEMPTS = 6;

/** Exponential backoff: 1m, 2m, 4m, 8m, 16m, 32m. */
function backoffMs(attempts: number) {
  return 60_000 * 2 ** Math.min(attempts, 5);
}

/**
 * In-memory until a database is connected. Replace with a durable table — an
 * in-process queue loses everything on deploy, which for accounting means a
 * silently missing ledger entry.
 */
const queue = new Map<string, PendingSync>();

function key(milestoneId: string, event: string) {
  return `${milestoneId}:${event}`;
}

export function enqueue(params: {
  milestoneId: string;
  contractId: string;
  event: "funded" | "released";
  rail: "stripe" | "paypal";
  error?: string;
}) {
  const k = key(params.milestoneId, params.event);
  const existing = queue.get(k);
  const attempts = (existing?.attempts ?? 0) + 1;

  queue.set(k, {
    milestoneId: params.milestoneId,
    contractId: params.contractId,
    event: params.event,
    rail: params.rail,
    attempts,
    lastError: params.error,
    queuedAt: existing?.queuedAt ?? new Date().toISOString(),
    nextAttemptAt:
      attempts >= MAX_ATTEMPTS ? null : Date.now() + backoffMs(attempts),
  });
}

export function dequeue(milestoneId: string, event: string) {
  queue.delete(key(milestoneId, event));
}

/** Entries whose backoff has elapsed. */
export function due(now = Date.now()): PendingSync[] {
  return [...queue.values()].filter(
    (p) => p.nextAttemptAt !== null && p.nextAttemptAt <= now,
  );
}

/**
 * Entries that have exhausted their retries. These need a human: the ledger is
 * missing an entry and no amount of further retrying will fix it.
 */
export function exhausted(): PendingSync[] {
  return [...queue.values()].filter((p) => p.nextAttemptAt === null);
}

export function pending(): PendingSync[] {
  return [...queue.values()];
}
