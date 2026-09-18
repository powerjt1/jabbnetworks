"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Paperclip, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  Field,
  Input,
  Textarea,
} from "@/components/ui";
import type { BudgetType } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface DraftMilestone {
  key: string;
  title: string;
  amount: string;
  dueDate: string;
}

export function ProposalForm({
  jobId,
  budgetType,
  suggestedMilestones,
}: {
  jobId: string;
  budgetType: BudgetType;
  suggestedMilestones: { title: string; amount: number; dueDate: string }[];
}) {
  const router = useRouter();
  const [milestones, setMilestones] = useState<DraftMilestone[]>(
    suggestedMilestones.map((m) => ({
      key: crypto.randomUUID(),
      title: m.title,
      amount: m.amount ? String(m.amount) : "",
      dueDate: m.dueDate,
    })),
  );
  const [files, setFiles] = useState<string[]>([]);

  const total = milestones.reduce((s, m) => s + (Number(m.amount) || 0), 0);

  function update(key: string, patch: Partial<DraftMilestone>) {
    setMilestones((prev) =>
      prev.map((m) => (m.key === key ? { ...m, ...patch } : m)),
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/jobs/${jobId}`);
      }}
    >
      <Card className="space-y-5 p-5">
        <h2 className="font-semibold tracking-tight">Your terms</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={budgetType === "hourly" ? "Your hourly rate" : "Your bid"}
            required
          >
            <Input
              type="number"
              min={0}
              placeholder={budgetType === "hourly" ? "145" : "64000"}
              required
            />
          </Field>
          <Field label="Your estimated duration" required>
            <Input placeholder="5 months" required />
          </Field>
        </div>
      </Card>

      <Card className="space-y-4 p-5">
        <div>
          <h2 className="font-semibold tracking-tight">Delivery approach</h2>
          <p className="mt-0.5 text-sm text-ink-3">
            The strongest proposals disagree with something in the brief and say
            why.
          </p>
        </div>
        <Field label="Cover letter" required>
          <Textarea
            className="min-h-56"
            required
            placeholder={`I have run three migrations of this shape, the largest at 310 workflows.

The part most proposals will understate is the inventory. A raw export tells you what exists, not what matters…

On your wave 2 date: I would want a fortnight of discovery before committing to it, because…`}
          />
        </Field>
      </Card>

      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold tracking-tight">
              Your milestone plan
            </h2>
            <p className="mt-0.5 text-sm text-ink-3">
              Pre-filled from the client&apos;s plan. Change it if you would
              sequence the work differently.
            </p>
          </div>
          {total > 0 && (
            <div className="shrink-0 text-right">
              <p className="text-xs text-ink-3">Total</p>
              <p className="font-semibold tabular-nums">
                {formatCurrency(total)}
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
                <span className="font-mono text-xs text-ink-3">M{i + 1}</span>
                <button
                  type="button"
                  onClick={() =>
                    setMilestones((prev) => prev.filter((x) => x.key !== m.key))
                  }
                  aria-label={`Remove milestone ${i + 1}`}
                  className="rounded p-1 text-ink-3 transition-colors hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="space-y-3">
                <Input
                  value={m.title}
                  onChange={(e) => update(m.key, { title: e.target.value })}
                  placeholder="Milestone title"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    type="number"
                    min={0}
                    value={m.amount}
                    onChange={(e) => update(m.key, { amount: e.target.value })}
                    placeholder="Amount (USD)"
                  />
                  <Input
                    type="date"
                    value={m.dueDate}
                    onChange={(e) => update(m.key, { dueDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            setMilestones((prev) => [
              ...prev,
              { key: crypto.randomUUID(), title: "", amount: "", dueDate: "" },
            ])
          }
        >
          <Plus className="size-4" />
          Add milestone
        </Button>
      </Card>

      <Card className="space-y-4 p-5">
        <h2 className="font-semibold tracking-tight">Attachments</h2>
        <p className="text-sm text-ink-3">
          Case studies, an approach document, reference architecture.
        </p>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-line p-8 text-center transition-colors hover:border-brand/50">
          <Paperclip className="size-5 text-ink-3" />
          <span className="text-sm">
            <span className="text-brand-soft">Choose files</span> or drag them
            here
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

      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="lg">
          Submit proposal
        </Button>
        <Button type="button" variant="secondary" size="lg">
          Save draft
        </Button>
      </div>
    </form>
  );
}
