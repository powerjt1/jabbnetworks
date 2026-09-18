"use client";

import { useState } from "react";
import { Check, Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";
import {
  Button,
  Card,
  Field,
  Input,
  Select,
} from "@/components/ui";
import type { TaxClassification } from "@/lib/tax/types";

const CLASSIFICATIONS: { value: TaxClassification; label: string }[] = [
  { value: "individual", label: "Individual / sole proprietor" },
  { value: "c_corp", label: "C corporation" },
  { value: "s_corp", label: "S corporation" },
  { value: "partnership", label: "Partnership" },
  { value: "trust_estate", label: "Trust / estate" },
  { value: "llc_c", label: "LLC taxed as C corporation" },
  { value: "llc_s", label: "LLC taxed as S corporation" },
  { value: "llc_p", label: "LLC taxed as partnership" },
  { value: "other", label: "Other" },
];

export function W9Panel() {
  const [tin, setTin] = useState("");
  const [showTin, setShowTin] = useState(false);
  const [tinType, setTinType] = useState<"ssn" | "ein">("ssn");
  const [certified, setCertified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string>();
  const [error, setError] = useState<string>();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setBusy(true);
    setError(undefined);

    try {
      const res = await fetch("/api/tax/w9", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payeeId: "u_you",
          legalName: data.get("legalName"),
          businessName: data.get("businessName") || undefined,
          classification: data.get("classification"),
          tin,
          tinType,
          address: {
            line1: data.get("line1"),
            city: data.get("city"),
            state: data.get("state"),
            postalCode: data.get("postalCode"),
            country: data.get("country"),
          },
          certified,
        }),
      });

      const body = (await res.json()) as {
        error?: string;
        status?: string;
        tinLast4?: string;
      };
      if (!res.ok) throw new Error(body.error ?? "Submission failed.");

      // Clear the number from component state the moment it is accepted.
      setTin("");
      setResult(
        `Submitted — ending ${body.tinLast4}. Verification usually completes within two business days.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3 border-b border-line-soft pb-4">
        <Lock className="mt-0.5 size-4 shrink-0 text-ink-3" />
        <div>
          <h3 className="font-medium">Form W-9</h3>
          <p className="mt-1 max-w-xl text-sm text-ink-2">
            Required only if you are paid outside Stripe. Stripe Connect
            collects its own tax details and files those 1099s directly, so if
            every payment reaches you through Stripe you can skip this.
          </p>
        </div>
      </div>

      <form className="mt-5 space-y-5" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Legal name" hint="As shown on your tax return." required>
            <Input name="legalName" required />
          </Field>
          <Field label="Business name" hint="If different from above.">
            <Input name="businessName" />
          </Field>
        </div>

        <Field label="Federal tax classification" required>
          <Select name="classification" defaultValue="individual" required>
            {CLASSIFICATIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium">
            Taxpayer identification number
          </legend>

          <div className="flex gap-2">
            {(["ssn", "ein"] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tinType === t}
                onClick={() => setTinType(t)}
                className={
                  tinType === t
                    ? "rounded-lg border border-brand bg-brand/10 px-3 py-1.5 text-sm font-medium"
                    : "rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink-3 hover:text-ink"
                }
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="relative">
            <Input
              // Never a plain text input by default, and never autofilled.
              type={showTin ? "text" : "password"}
              value={tin}
              onChange={(e) => setTin(e.target.value)}
              placeholder={tinType === "ssn" ? "123-45-6789" : "12-3456789"}
              autoComplete="off"
              inputMode="numeric"
              aria-label="Taxpayer identification number"
              className="pr-10 font-mono"
              required
            />
            <button
              type="button"
              onClick={() => setShowTin((v) => !v)}
              aria-label={showTin ? "Hide number" : "Show number"}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1.5 text-ink-3 transition-colors hover:text-ink"
            >
              {showTin ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>

          <p className="flex items-start gap-1.5 text-xs text-ink-3">
            <ShieldCheck className="mt-0.5 size-3 shrink-0 text-positive" />
            Sent straight to the verification provider. JABB stores only the
            last four digits — never the full number, in the database or
            anywhere else.
          </p>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-medium">Address</legend>
          <Field label="Street address" required>
            <Input name="line1" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <Field label="City" required>
                <Input name="city" required />
              </Field>
            </div>
            <Field label="State" required>
              <Input name="state" required />
            </Field>
            <Field label="ZIP" required>
              <Input name="postalCode" required />
            </Field>
          </div>
          <Field label="Country" required>
            <Input name="country" defaultValue="US" required />
          </Field>
        </fieldset>

        <label className="flex items-start gap-2.5 rounded-lg border border-line-soft bg-surface p-3">
          <input
            type="checkbox"
            checked={certified}
            onChange={(e) => setCertified(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[var(--color-brand)]"
          />
          <span className="text-sm text-ink-2">
            Under penalties of perjury, I certify that the number shown is my
            correct taxpayer identification number, that I am not subject to
            backup withholding, and that I am a U.S. person.
          </span>
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}
        {result && (
          <p className="flex items-start gap-1.5 text-sm text-positive">
            <Check className="mt-0.5 size-4 shrink-0" />
            {result}
          </p>
        )}

        <Button type="submit" disabled={busy || !certified || !tin}>
          {busy ? "Submitting…" : "Submit W-9"}
        </Button>
      </form>
    </Card>
  );
}
