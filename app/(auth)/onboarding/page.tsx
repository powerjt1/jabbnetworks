"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Check } from "lucide-react";
import {
  Button,
  Card,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { SKILLS, TONE_CLASSES } from "@/lib/skills";
import type { Role, SkillCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

function OnboardingFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const role: Role = params.get("role") === "client" ? "client" : "freelancer";

  const [step, setStep] = useState(0);
  const [skills, setSkills] = useState<SkillCategory[]>([]);

  const steps =
    role === "freelancer"
      ? ["Your profile", "Your stack", "Rates & availability"]
      : ["Your profile", "What you need", "How you work"];

  const isLast = step === steps.length - 1;

  function toggleSkill(id: SkillCategory) {
    setSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium transition-colors",
                  i < step && "bg-positive text-canvas",
                  i === step && "bg-brand text-white",
                  i > step && "bg-surface-2 text-ink-3",
                )}
              >
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </span>
              {i < steps.length - 1 && (
                <span
                  className={cn(
                    "h-px flex-1 transition-colors",
                    i < step ? "bg-positive" : "bg-line",
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm font-medium">{steps[step]}</p>
        <p className="text-xs text-ink-3">
          Step {step + 1} of {steps.length}
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (isLast) router.push("/dashboard");
          else setStep((s) => s + 1);
        }}
      >
        {step === 0 && (
          <>
            <Field label="Professional title" required>
              <Input
                placeholder={
                  role === "freelancer"
                    ? "Power Platform & RPA Architect"
                    : "Director of Digital Operations"
                }
                required
              />
            </Field>
            {role === "client" && (
              <Field label="Company" required>
                <Input placeholder="Northwind Logistics" required />
              </Field>
            )}
            <Field label="Location">
              <Input placeholder="Austin, TX" />
            </Field>
            <Field
              label={role === "freelancer" ? "Short bio" : "About your team"}
              hint="What you want the other side to know before they talk to you."
            >
              <Textarea
                placeholder={
                  role === "freelancer"
                    ? "Twelve years automating enterprise back-office work…"
                    : "Running the automation programme for a 4,000-person operator…"
                }
              />
            </Field>
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-sm text-ink-2">
              {role === "freelancer"
                ? "Pick the disciplines you deliver in. These drive the work we surface to you."
                : "Pick the disciplines you hire for. We use these to route your posts."}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {SKILLS.map((skill) => {
                const active = skills.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleSkill(skill.id)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-colors",
                      active
                        ? "border-brand bg-brand/10"
                        : "border-line bg-surface hover:border-line",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-flex rounded px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                        TONE_CLASSES[skill.tone],
                      )}
                    >
                      {skill.label}
                    </span>
                    <p className="mt-2 text-xs text-ink-3">{skill.blurb}</p>
                  </button>
                );
              })}
            </div>
            {skills.length > 0 && (
              <p className="text-xs text-ink-3">{skills.length} selected</p>
            )}
          </>
        )}

        {step === 2 && role === "freelancer" && (
          <>
            <Field label="Hourly rate (USD)" required>
              <Input type="number" placeholder="145" min={0} required />
            </Field>
            <Field label="Availability">
              <Select defaultValue="available">
                <option value="available">Available now</option>
                <option value="limited">Limited availability</option>
                <option value="booked">Fully booked</option>
              </Select>
            </Field>
            <Field
              label="Certifications"
              hint="One per line. These are shown on your profile."
            >
              <Textarea placeholder={"Power Platform Solution Architect Expert\nUiPath Advanced RPA Developer"} />
            </Field>
          </>
        )}

        {step === 2 && role === "client" && (
          <>
            <Field label="Typical engagement size">
              <Select defaultValue="mid">
                <option value="small">Under $25k</option>
                <option value="mid">$25k – $100k</option>
                <option value="large">Over $100k</option>
              </Select>
            </Field>
            <Field label="How do you prefer to contract?">
              <Select defaultValue="fixed">
                <option value="fixed">Fixed price with milestones</option>
                <option value="hourly">Hourly</option>
                <option value="both">Depends on the work</option>
              </Select>
            </Field>
            <Field
              label="Constraints we should know about"
              hint="Data residency, ALM requirements, security review — anything that filters who can bid."
            >
              <Textarea placeholder="All flows must deploy through our existing ALM pipeline…" />
            </Field>
          </>
        )}

        <div className="flex gap-2 pt-2">
          {step > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </Button>
          )}
          <Button type="submit" className="flex-1">
            {isLast ? "Finish setup" : "Continue"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<Card className="p-6 text-sm text-ink-3">Loading…</Card>}>
      <OnboardingFlow />
    </Suspense>
  );
}
