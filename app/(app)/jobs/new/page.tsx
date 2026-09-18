"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Paperclip, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Select,
  SkillChip,
  Textarea,
} from "@/components/ui";
import { SKILLS, TONE_CLASSES } from "@/lib/skills";
import type { BudgetType, SkillCategory } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

interface DraftMilestone {
  key: string;
  title: string;
  amount: string;
  dueDate: string;
  deliverables: string;
}

function blankMilestone(): DraftMilestone {
  return {
    key: crypto.randomUUID(),
    title: "",
    amount: "",
    dueDate: "",
    deliverables: "",
  };
}

export default function NewJobPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<SkillCategory[]>([]);
  const [budgetType, setBudgetType] = useState<BudgetType>("fixed");
  const [milestones, setMilestones] = useState<DraftMilestone[]>([
    blankMilestone(),
  ]);
  const [files, setFiles] = useState<string[]>([]);

  const milestoneTotal = milestones.reduce(
    (sum, m) => sum + (Number(m.amount) || 0),
    0,
  );

  function updateMilestone(key: string, patch: Partial<DraftMilestone>) {
    setMilestones((prev) =>
      prev.map((m) => (m.key === key ? { ...m, ...patch } : m)),
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        All work
      </Link>

      <PageHeader
        title="Post a job"
        description="The more specific the scope, the better the proposals. Name your constraints — they filter harder than your budget does."
      />

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/jobs");
        }}
      >
        <Card className="space-y-5 p-5">
          <h2 className="font-semibold tracking-tight">The basics</h2>

          <Field label="Job title" required>
            <Input
              placeholder="Migrate 240 Nintex workflows to Power Automate"
              required
            />
          </Field>

          <Field
            label="One-line summary"
            hint="Shown on the job board. Lead with the outcome, not the technology."
            required
          >
            <Input
              placeholder="Full inventory, triage and conversion of a Nintex estate onto Power Automate."
              required
            />
          </Field>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">
              Disciplines <span className="text-danger">*</span>
            </legend>
            <p className="mb-2 text-xs text-ink-3">
              Specialists filter on these. Pick only what the work genuinely needs.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SKILLS.map((skill) => {
                const active = skills.includes(skill.id);
                return (
                  <button
                    key={skill.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setSkills((prev) =>
                        prev.includes(skill.id)
                          ? prev.filter((s) => s !== skill.id)
                          : [...prev, skill.id],
                      )
                    }
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors",
                      active
                        ? TONE_CLASSES[skill.tone]
                        : "bg-surface text-ink-3 ring-line hover:text-ink",
                    )}
                  >
                    {skill.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </Card>

        <Card className="space-y-5 p-5">
          <h2 className="font-semibold tracking-tight">Job scope</h2>
          <Field
            label="Full scope"
            hint="Current state, what you need delivered, and the constraints that rule people out. Specialists read this before they read your budget."
            required
          >
            <Textarea
              className="min-h-64 font-mono text-[13px]"
              required
              placeholder={`Current state:
- 240 published Nintex workflows across 31 site collections
- 40 are business-critical and call our TMS

What we need:
1. Inventory and complexity scoring
2. Conversion to Power Automate, solution-aware
3. Parity test evidence signed off by process owners

Constraints:
- Managed solutions only, deployed through our ALM pipeline
- Service accounts, no user-owned connections
- Data cannot leave the EU or US tenants`}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Experience level">
              <Select defaultValue="expert">
                <option value="entry">Entry</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </Select>
            </Field>
            <Field label="Estimated duration">
              <Input placeholder="4-6 months" />
            </Field>
          </div>

          <Field
            label="Environments"
            hint="Comma separated — PROD-EU, UAT, DEV."
          >
            <Input placeholder="PROD-EU, PROD-US, UAT, DEV" />
          </Field>
        </Card>

        <Card className="space-y-5 p-5">
          <h2 className="font-semibold tracking-tight">Budget</h2>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Budget type</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["fixed", "Fixed price", "Budget released per milestone"],
                  ["hourly", "Hourly", "Billed against approved timesheets"],
                ] as const
              ).map(([value, label, body]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={budgetType === value}
                  onClick={() => setBudgetType(value)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    budgetType === value
                      ? "border-brand bg-brand/10"
                      : "border-line bg-surface hover:border-line",
                  )}
                >
                  <p className="text-sm font-medium">{label}</p>
                  <p className="mt-0.5 text-xs text-ink-3">{body}</p>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={budgetType === "fixed" ? "Budget from" : "Rate from"}
              required
            >
              <Input
                type="number"
                min={0}
                placeholder={budgetType === "fixed" ? "48000" : "110"}
                required
              />
            </Field>
            <Field
              label={budgetType === "fixed" ? "Budget to" : "Rate to"}
              required
            >
              <Input
                type="number"
                min={0}
                placeholder={budgetType === "fixed" ? "72000" : "160"}
                required
              />
            </Field>
          </div>

          <Field label="Final due date" required>
            <Input type="date" required />
          </Field>
        </Card>

        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold tracking-tight">Milestones</h2>
              <p className="mt-0.5 text-sm text-ink-3">
                Budget releases as each is approved.
              </p>
            </div>
            {milestoneTotal > 0 && (
              <div className="text-right">
                <p className="text-xs text-ink-3">Total</p>
                <p className="font-semibold tabular-nums">
                  {formatCurrency(milestoneTotal)}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div
                key={m.key}
                className="rounded-lg border border-line-soft bg-surface p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-ink-3">
                    Milestone {i + 1}
                  </span>
                  {milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setMilestones((prev) =>
                          prev.filter((x) => x.key !== m.key),
                        )
                      }
                      aria-label={`Remove milestone ${i + 1}`}
                      className="rounded p-1 text-ink-3 transition-colors hover:text-danger"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <Input
                    value={m.title}
                    onChange={(e) =>
                      updateMilestone(m.key, { title: e.target.value })
                    }
                    placeholder="Inventory & complexity scoring"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      type="number"
                      min={0}
                      value={m.amount}
                      onChange={(e) =>
                        updateMilestone(m.key, { amount: e.target.value })
                      }
                      placeholder="Amount (USD)"
                    />
                    <Input
                      type="date"
                      value={m.dueDate}
                      onChange={(e) =>
                        updateMilestone(m.key, { dueDate: e.target.value })
                      }
                    />
                  </div>
                  <Input
                    value={m.deliverables}
                    onChange={(e) =>
                      updateMilestone(m.key, { deliverables: e.target.value })
                    }
                    placeholder="Deliverables, comma separated"
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setMilestones((prev) => [...prev, blankMilestone()])}
          >
            <Plus className="size-4" />
            Add milestone
          </Button>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-semibold tracking-tight">Attachments</h2>
          <p className="text-sm text-ink-3">
            Inventories, architecture diagrams, security requirements — anything
            a specialist needs to scope accurately.
          </p>
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-line p-8 text-center transition-colors hover:border-brand/50">
            <Paperclip className="size-5 text-ink-3" />
            <span className="text-sm">
              <span className="text-brand-soft">Choose files</span> or drag them
              here
            </span>
            <span className="text-xs text-ink-3">
              PDF, DOCX, XLSX or ZIP up to 50 MB each
            </span>
            <input
              type="file"
              multiple
              className="sr-only"
              onChange={(e) =>
                setFiles(Array.from(e.target.files ?? []).map((f) => f.name))
              }
            />
          </label>
          {files.length > 0 && (
            <ul className="space-y-1.5">
              {files.map((name) => (
                <li
                  key={name}
                  className="flex items-center gap-2 rounded-md bg-surface-2 px-3 py-2 text-sm"
                >
                  <Paperclip className="size-3.5 text-ink-3" />
                  {name}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {skills.length > 0 && (
          <Card className="p-5">
            <p className="mb-2 text-xs font-medium tracking-wide text-ink-3 uppercase">
              This job will be routed to
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <SkillChip key={s} id={s} />
              ))}
            </div>
          </Card>
        )}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg">
            Publish job
          </Button>
          <Button type="button" variant="secondary" size="lg">
            Save as draft
          </Button>
        </div>
      </form>
    </div>
  );
}
