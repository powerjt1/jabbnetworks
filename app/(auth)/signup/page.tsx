"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Briefcase, UserRound } from "lucide-react";
import { Button, Card, Field, Input } from "@/components/ui";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";

const ROLES: { id: Role; label: string; body: string; icon: typeof UserRound }[] = [
  {
    id: "client",
    label: "I'm hiring",
    body: "Post scopes and bring on specialists",
    icon: Briefcase,
  },
  {
    id: "freelancer",
    label: "I'm available for work",
    body: "Find contracts that match your stack",
    icon: UserRound,
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("freelancer");

  return (
    <Card className="p-6">
      <h1 className="text-xl font-semibold tracking-tight">Create your account</h1>
      <p className="mt-1.5 text-sm text-ink-2">
        Two minutes to set up. You can change your role later.
      </p>

      <form
        className="mt-6 space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(`/onboarding?role=${role}`);
        }}
      >
        <fieldset>
          <legend className="mb-2 text-sm font-medium">
            How will you use JABB?
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {ROLES.map((r) => {
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    active
                      ? "border-brand bg-brand/10"
                      : "border-line bg-surface hover:border-line",
                  )}
                >
                  <r.icon
                    className={cn(
                      "size-4",
                      active ? "text-brand-soft" : "text-ink-3",
                    )}
                  />
                  <p className="mt-2 text-sm font-medium">{r.label}</p>
                  <p className="mt-0.5 text-xs text-ink-3">{r.body}</p>
                </button>
              );
            })}
          </div>
        </fieldset>

        <Field label="Full name" required>
          <Input name="name" placeholder="Jordan Thorpe" required />
        </Field>
        <Field label="Work email" required>
          <Input
            name="email"
            type="email"
            placeholder="you@company.com"
            required
          />
        </Field>
        <Field label="Password" hint="At least 12 characters." required>
          <Input name="password" type="password" minLength={12} required />
        </Field>

        <Button type="submit" className="w-full" size="lg">
          Continue
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-3">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-soft hover:text-ink">
          Log in
        </Link>
      </p>
    </Card>
  );
}
