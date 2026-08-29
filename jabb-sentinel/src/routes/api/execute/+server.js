import { json } from '@sveltejs/kit';
import { SentinelOrchestrator } from '$lib/orchestrator/SentinelOrchestrator.js';

/**
 * POST /api/execute  { "task": "..." }
 * Runs the Sentinel orchestrator end-to-end (plan → execute → validate → report).
 * Server-side only: LLM keys come from environment variables (see .env.example / backend).
 */
export async function POST({ request }) {
  try {
    const { task } = await request.json();
    if (!task || typeof task !== 'string') return json({ error: 'Provide a "task" string.' }, { status: 400 });
    const sentinel = new SentinelOrchestrator();
    const log = await sentinel.executeDevelopmentTask(task);
    return json(log);
  } catch (e) {
    return json({ error: e.message }, { status: 500 });
  }
}
