import { CheckCircle2, CircleDashed } from "lucide-react";
import { Card } from "@/components/ui";

const PROVIDERS = [
  {
    key: "stripe",
    name: "Stripe Connect",
    role: "Escrow, card and ACH funding, payouts",
    envVars: ["STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET"],
    signup: "dashboard.stripe.com/register",
  },
  {
    key: "plaid",
    name: "Plaid",
    role: "Instant bank verification for ACH",
    envVars: ["PLAID_CLIENT_ID", "PLAID_SECRET", "NEXT_PUBLIC_PLAID_ENV"],
    signup: "dashboard.plaid.com/signup",
  },
  {
    key: "paypal",
    name: "PayPal Payouts",
    role: "Alternative payout rail for freelancers",
    envVars: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_ENV"],
    signup: "developer.paypal.com",
  },
  {
    key: "daily",
    name: "Daily.co",
    role: "Video meeting rooms",
    envVars: ["DAILY_API_KEY", "NEXT_PUBLIC_DAILY_DOMAIN"],
    signup: "dashboard.daily.co/signup",
  },
] as const;

export function ProviderStatus(props: Record<string, boolean>) {
  const allConfigured = PROVIDERS.every((p) => props[p.key]);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
        <h2 className="font-semibold tracking-tight">Integrations</h2>
        {!allConfigured && (
          <p className="text-sm text-ink-3">
            Unconfigured providers fall back to demo data.
          </p>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {PROVIDERS.map((provider) => {
          const on = Boolean(props[provider.key]);
          return (
            <Card key={provider.key} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{provider.name}</p>
                  <p className="mt-0.5 text-sm text-ink-3">{provider.role}</p>
                </div>
                {on ? (
                  <CheckCircle2 className="size-4 shrink-0 text-positive" />
                ) : (
                  <CircleDashed className="size-4 shrink-0 text-ink-3" />
                )}
              </div>

              {!on && (
                <div className="mt-3 border-t border-line-soft pt-3">
                  <p className="text-xs text-ink-3">
                    Sign up at{" "}
                    <span className="font-mono text-brand-soft">
                      {provider.signup}
                    </span>
                    , then set:
                  </p>
                  <ul className="mt-1.5 space-y-0.5">
                    {provider.envVars.map((v) => (
                      <li
                        key={v}
                        className="font-mono text-xs text-ink-2"
                      >
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
