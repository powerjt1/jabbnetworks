"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  Avatar,
  Button,
  Card,
  Field,
  Input,
  Select,
  SkillChip,
  Textarea,
} from "@/components/ui";
import { SKILLS, TONE_CLASSES } from "@/lib/skills";
import type { SkillCategory, User } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = ["Profile", "Stack & rates", "Notifications", "Payouts"] as const;
type Tab = (typeof TABS)[number];

const NOTIFICATIONS = [
  ["New jobs matching your stack", true],
  ["Proposal status changes", true],
  ["New messages", true],
  ["Milestone approvals and payments", true],
  ["Due date reminders", true],
  ["Weekly summary of network activity", false],
  ["Product updates from JABB", false],
] as const;

export function SettingsForm({ user }: { user: User }) {
  const [tab, setTab] = useState<Tab>("Profile");
  const [skills, setSkills] = useState<SkillCategory[]>(user.skills);
  const [saved, setSaved] = useState(false);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        className="flex flex-wrap gap-1 border-b border-line-soft"
      >
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm transition-colors",
              tab === t
                ? "border-brand font-medium text-ink"
                : "border-transparent text-ink-3 hover:text-ink",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <form onSubmit={save} className="space-y-6">
        {tab === "Profile" && (
          <Card className="space-y-5 p-5">
            <div className="flex items-center gap-4">
              <Avatar initials={user.avatarInitials} size="lg" />
              <div>
                <Button type="button" variant="secondary" size="sm">
                  Change photo
                </Button>
                <p className="mt-1.5 text-xs text-ink-3">
                  JPG or PNG, at least 400×400.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <Input defaultValue={user.name} required />
              </Field>
              <Field label="Professional title" required>
                <Input defaultValue={user.title} required />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Location">
                <Input defaultValue={user.location} />
              </Field>
              <Field label="Timezone">
                <Input defaultValue={user.timezone} />
              </Field>
            </div>

            <Field
              label="Bio"
              hint="What you want a client to know before they contact you."
            >
              <Textarea defaultValue={user.bio} className="min-h-32" />
            </Field>

            <Field
              label="Certifications"
              hint="One per line. Shown on your public profile."
            >
              <Textarea
                defaultValue={user.certifications.join("\n")}
                className="min-h-24"
              />
            </Field>
          </Card>
        )}

        {tab === "Stack & rates" && (
          <>
            <Card className="space-y-4 p-5">
              <div>
                <h2 className="font-semibold tracking-tight">Your stack</h2>
                <p className="mt-0.5 text-sm text-ink-3">
                  Drives which jobs we surface to you.
                </p>
              </div>
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
              {skills.length > 0 && (
                <div className="border-t border-line-soft pt-4">
                  <p className="mb-2 text-xs font-medium tracking-wide text-ink-3 uppercase">
                    Shown on your profile
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <SkillChip key={s} id={s} />
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card className="space-y-5 p-5">
              <h2 className="font-semibold tracking-tight">Rates</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Hourly rate (USD)">
                  <Input type="number" defaultValue={user.hourlyRate} min={0} />
                </Field>
                <Field label="Availability">
                  <Select defaultValue={user.availability}>
                    <option value="available">Available now</option>
                    <option value="limited">Limited availability</option>
                    <option value="booked">Fully booked</option>
                  </Select>
                </Field>
              </div>
              <Field
                label="Minimum engagement"
                hint="Contracts below this are hidden from your feed."
              >
                <Select defaultValue="10000">
                  <option value="0">No minimum</option>
                  <option value="10000">$10,000</option>
                  <option value="25000">$25,000</option>
                  <option value="50000">$50,000</option>
                </Select>
              </Field>
            </Card>
          </>
        )}

        {tab === "Notifications" && (
          <Card className="p-5">
            <h2 className="font-semibold tracking-tight">Email me about</h2>
            <ul className="mt-4 divide-y divide-line-soft">
              {NOTIFICATIONS.map(([label, on]) => (
                <li
                  key={label}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="text-sm">{label}</span>
                  <input
                    type="checkbox"
                    defaultChecked={on}
                    aria-label={label}
                    className="size-4 shrink-0 accent-[var(--color-brand)]"
                  />
                </li>
              ))}
            </ul>
          </Card>
        )}

        {tab === "Payouts" && (
          <>
            <Card className="space-y-5 p-5">
              <div>
                <h2 className="font-semibold tracking-tight">Payout method</h2>
                <p className="mt-0.5 text-sm text-ink-3">
                  Milestone payments release here once a client approves.
                </p>
              </div>
              <Field label="Method">
                <Select defaultValue="bank">
                  <option value="bank">Bank transfer (ACH)</option>
                  <option value="wire">International wire</option>
                  <option value="paypal">PayPal</option>
                </Select>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Account holder">
                  <Input defaultValue={user.name} />
                </Field>
                <Field label="Account number">
                  <Input type="password" defaultValue="000000000000" />
                </Field>
              </div>
            </Card>

            <Card className="space-y-5 p-5">
              <h2 className="font-semibold tracking-tight">Tax details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tax residency">
                  <Select defaultValue="us">
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="eu">European Union</option>
                    <option value="other">Other</option>
                  </Select>
                </Field>
                <Field label="Business structure">
                  <Select defaultValue="llc">
                    <option value="sole">Sole proprietor</option>
                    <option value="llc">LLC</option>
                    <option value="corp">Corporation</option>
                  </Select>
                </Field>
              </div>
            </Card>
          </>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit">Save changes</Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-positive">
              <Check className="size-4" />
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
