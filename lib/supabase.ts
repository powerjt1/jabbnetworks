import { createBrowserClient } from "@supabase/ssr";

/**
 * Returns null when Supabase is not configured, which is the default. The app
 * falls back to seed data in that case — see lib/data.ts.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
