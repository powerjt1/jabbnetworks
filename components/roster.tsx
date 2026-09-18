import { Crown, Shield, UserRound } from "lucide-react";
import { Avatar, Badge } from "@/components/ui";
import type { AgencyMember, Assignment, User } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const ROLE_ICON = {
  owner: Crown,
  admin: Shield,
  member: UserRound,
} as const;

const ROLE_TONE = {
  owner: "brand",
  admin: "neutral",
  member: "neutral",
} as const;

export function Roster({
  roster,
}: {
  roster: { member: AgencyMember; user: User }[];
}) {
  return (
    <ul className="divide-y divide-line-soft">
      {roster.map(({ member, user }) => {
        const Icon = ROLE_ICON[member.role];
        return (
          <li key={user.id} className="flex items-center gap-3 py-3">
            <Avatar initials={user.avatarInitials} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{user.name}</p>
                <Badge tone={ROLE_TONE[member.role]}>
                  <Icon className="size-3" />
                  {member.role}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-sm text-ink-3">
                {member.title} · {user.location}
              </p>
            </div>
            {user.hourlyRate && (
              <span className="shrink-0 text-sm text-ink-3 tabular-nums">
                {formatCurrency(user.hourlyRate)}/hr
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Who is staffed on a contract and what each of them earns from it.
 *
 * Splits are stored in basis points so they sum exactly; showing the resulting
 * cash next to each share is what makes a disagreement about the split
 * surface before the contract starts rather than after the first release.
 */
export function AssignmentTable({
  assignments,
  users,
  contractValue,
}: {
  assignments: Assignment[];
  users: Map<string, User>;
  /** Total contract value in dollars. */
  contractValue: number;
}) {
  const total = assignments.reduce((sum, a) => sum + a.splitBps, 0);
  const balanced = total === 10_000;

  return (
    <div>
      <ul className="divide-y divide-line-soft">
        {assignments.map((assignment) => {
          const user = users.get(assignment.userId);
          if (!user) return null;
          const share = (contractValue * assignment.splitBps) / 10_000;
          return (
            <li key={assignment.userId} className="flex items-center gap-3 py-3">
              <Avatar initials={user.avatarInitials} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-ink-3">{assignment.role}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-medium tabular-nums">
                  {formatCurrency(share)}
                </p>
                <p className="text-xs text-ink-3 tabular-nums">
                  {(assignment.splitBps / 100).toFixed(1)}%
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {!balanced && (
        <p className="mt-2 text-xs text-danger">
          Splits total {(total / 100).toFixed(1)}% — they must come to 100%
          before this contract can be awarded.
        </p>
      )}
    </div>
  );
}
