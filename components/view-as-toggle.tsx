"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Escrow looks different from each side — the client funds and releases, the
 * freelancer watches. Without a way to switch, half the feature is invisible
 * on any given account, so this exists to make both sides reachable while
 * there is no real auth.
 *
 * Delete it once sessions are wired: the signed-in user's role on the contract
 * is the real answer.
 */
export function ViewAsToggle({
  current,
  basePath,
}: {
  current: "client" | "freelancer";
  basePath: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  function switchTo(role: "client" | "freelancer") {
    const next = new URLSearchParams(params.toString());
    next.set("as", role);
    router.push(`${basePath}?${next.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-ink-3">Demo — view as</span>
      <div
        role="group"
        aria-label="View this contract as"
        className="flex rounded-lg border border-line bg-surface p-0.5"
      >
        {(
          [
            ["client", "Client", Briefcase],
            ["freelancer", "Freelancer", UserRound],
          ] as const
        ).map(([role, label, Icon]) => {
          const active = current === role;
          return (
            <button
              key={role}
              type="button"
              aria-pressed={active}
              onClick={() => switchTo(role)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "bg-brand/15 text-brand-soft"
                  : "text-ink-3 hover:text-ink",
              )}
            >
              <Icon className="size-3" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
