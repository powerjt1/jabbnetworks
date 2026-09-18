"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Check,
  Crown,
  Mail,
  Shield,
  UserMinus,
  UserRound,
  Wand2,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Field,
  Input,
  Select,
} from "@/components/ui";
import type { AgencyMember, AgencyRole, User } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

const ROLE_ICON = { owner: Crown, admin: Shield, member: UserRound } as const;

interface Row {
  member: AgencyMember;
  user: User;
  splitBps: number;
}

export function TeamManager({
  roster,
  /** A representative contract value, so splits show as money not percentages. */
  sampleValue,
  canManage,
}: {
  roster: { member: AgencyMember; user: User }[];
  sampleValue: number;
  canManage: boolean;
}) {
  // Seed an even split so the editor starts balanced rather than at zero.
  const [rows, setRows] = useState<Row[]>(() => {
    const even = Math.floor(10_000 / roster.length);
    return roster.map((r, i) => ({
      ...r,
      // Give the remainder to the first row so the total is exactly 10,000.
      splitBps: i === 0 ? even + (10_000 - even * roster.length) : even,
    }));
  });
  const [invite, setInvite] = useState("");
  const [saved, setSaved] = useState(false);

  const total = rows.reduce((sum, r) => sum + r.splitBps, 0);
  const balanced = total === 10_000;
  const drift = total - 10_000;

  function setSplit(userId: string, percent: number) {
    const bps = Math.round(Math.max(0, Math.min(100, percent)) * 100);
    setRows((prev) =>
      prev.map((r) => (r.user.id === userId ? { ...r, splitBps: bps } : r)),
    );
    setSaved(false);
  }

  function setRole(userId: string, role: AgencyRole) {
    setRows((prev) =>
      prev.map((r) =>
        r.user.id === userId
          ? { ...r, member: { ...r.member, role } }
          : r,
      ),
    );
    setSaved(false);
  }

  /** Pushes the rounding remainder onto the first row so the total is exact. */
  function distributeEvenly() {
    const even = Math.floor(10_000 / rows.length);
    setRows((prev) =>
      prev.map((r, i) => ({
        ...r,
        splitBps: i === 0 ? even + (10_000 - even * rows.length) : even,
      })),
    );
    setSaved(false);
  }

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-semibold tracking-tight">Default revenue split</h2>
            <p className="mt-0.5 max-w-lg text-sm text-ink-3">
              Applied to new proposals as a starting point. You can override it
              per contract — the split that counts is the one on the proposal
              the client accepted.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={distributeEvenly}
            disabled={!canManage}
          >
            <Wand2 className="size-4" />
            Split evenly
          </Button>
        </div>

        <ul className="mt-5 divide-y divide-line-soft">
          {rows.map((row) => {
            const Icon = ROLE_ICON[row.member.role];
            const share = (sampleValue * row.splitBps) / 10_000;
            return (
              <li
                key={row.user.id}
                className="flex flex-wrap items-center gap-3 py-3"
              >
                <Avatar initials={row.user.avatarInitials} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{row.user.name}</p>
                    <Badge tone={row.member.role === "owner" ? "brand" : "neutral"}>
                      <Icon className="size-3" />
                      {row.member.role}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-ink-3">
                    {row.member.title}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={row.splitBps / 100}
                      onChange={(e) =>
                        setSplit(row.user.id, Number(e.target.value))
                      }
                      disabled={!canManage}
                      aria-label={`${row.user.name} revenue share, percent`}
                      className="w-24 pr-7 text-right tabular-nums"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-ink-3">
                      %
                    </span>
                  </div>
                  <span className="w-24 text-right text-sm text-ink-3 tabular-nums">
                    {formatCurrency(share)}
                  </span>
                  {canManage && row.member.role !== "owner" && (
                    <Select
                      value={row.member.role}
                      onChange={(e) =>
                        setRole(row.user.id, e.target.value as AgencyRole)
                      }
                      aria-label={`${row.user.name} role`}
                      className="w-28"
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                    </Select>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div
          className={cn(
            "mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg px-3 py-2.5",
            balanced
              ? "bg-positive/8 text-positive"
              : "bg-danger/8 text-danger",
          )}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            {balanced ? (
              <Check className="size-4" />
            ) : (
              <AlertTriangle className="size-4" />
            )}
            {balanced
              ? "Splits balance at 100%"
              : `${drift > 0 ? "Over" : "Under"} by ${Math.abs(drift / 100).toFixed(1)}%`}
          </span>
          <span className="text-sm tabular-nums">
            {(total / 100).toFixed(1)}% of {formatCurrency(sampleValue)}
          </span>
        </div>

        {canManage && (
          <div className="mt-4 flex items-center gap-3">
            <Button
              type="button"
              disabled={!balanced}
              onClick={() => setSaved(true)}
            >
              Save split
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-positive">
                <Check className="size-4" />
                Saved
              </span>
            )}
            {!balanced && (
              <span className="text-sm text-ink-3">
                Splits must total 100% before they can be saved.
              </span>
            )}
          </div>
        )}
      </Card>

      {canManage && (
        <Card className="p-5">
          <h2 className="font-semibold tracking-tight">Invite a specialist</h2>
          <p className="mt-0.5 text-sm text-ink-3">
            They join the roster once they accept. Only owners and admins can
            bid on the agency&apos;s behalf.
          </p>
          <form
            className="mt-4 flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              setInvite("");
            }}
          >
            <div className="min-w-56 flex-1">
              <Field label="Email address">
                <Input
                  type="email"
                  value={invite}
                  onChange={(e) => setInvite(e.target.value)}
                  placeholder="specialist@example.com"
                />
              </Field>
            </div>
            <Button type="submit" disabled={!invite.trim()}>
              <Mail className="size-4" />
              Send invite
            </Button>
          </form>
        </Card>
      )}

      {!canManage && (
        <Card className="p-4">
          <p className="flex items-start gap-2 text-sm text-ink-2">
            <UserMinus className="mt-0.5 size-4 shrink-0 text-ink-3" />
            You are a member of this agency. Owners and admins manage the roster
            and the revenue split.
          </p>
        </Card>
      )}
    </div>
  );
}
