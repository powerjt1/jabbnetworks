import { NextResponse } from "next/server";
import { drainQueue } from "@/lib/accounting/sync";
import { exhausted, pending } from "@/lib/accounting/queue";

/**
 * Retries accounting syncs that failed when their webhook fired.
 *
 * Point a scheduled job at this every few minutes. Protect it: without the
 * shared secret anyone can trigger repeated QuickBooks writes.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided = request.headers.get("authorization");
    if (provided !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
  }

  const result = await drainQueue();
  const stuck = exhausted();

  return NextResponse.json({
    ...result,
    // These will never succeed on their own. Something is missing from the
    // ledger and it needs a person, so surface them rather than retrying.
    exhausted: stuck.length,
    exhaustedItems: stuck.map((p) => ({
      milestoneId: p.milestoneId,
      event: p.event,
      attempts: p.attempts,
      lastError: p.lastError,
    })),
  });
}

/** Queue depth, for a health check or a dashboard. */
export async function GET() {
  const all = pending();
  return NextResponse.json({
    pending: all.length,
    exhausted: all.filter((p) => p.nextAttemptAt === null).length,
  });
}
