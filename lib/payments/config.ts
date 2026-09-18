/**
 * Every integration here is optional. When keys are absent the app runs in
 * demo mode against seed data — the same pattern as Supabase — so the whole
 * product is navigable before any account exists.
 *
 * Server-only secrets are read inside route handlers, never here, so this
 * module stays safe to import from a client component.
 */

export const providers = {
  stripe: {
    configured: Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
  },
  plaid: {
    configured: Boolean(process.env.NEXT_PUBLIC_PLAID_ENV),
    env: process.env.NEXT_PUBLIC_PLAID_ENV ?? "sandbox",
  },
  paypal: {
    configured: Boolean(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID),
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "",
  },
  daily: {
    configured: Boolean(process.env.NEXT_PUBLIC_DAILY_DOMAIN),
    domain: process.env.NEXT_PUBLIC_DAILY_DOMAIN ?? "",
  },
} as const;

export type ProviderKey = keyof typeof providers;

export const anyPaymentsConfigured =
  providers.stripe.configured ||
  providers.paypal.configured ||
  providers.plaid.configured;
