import {
  AGENCIES,
  CONTRACTS,
  CONVERSATIONS,
  CURRENT_USER_ID,
  JOBS,
  MESSAGES,
  NOTES,
  PROPOSALS,
  USERS,
} from "./seed";
import type {
  Agency,
  AgencyMember,
  Contract,
  Conversation,
  Job,
  Message,
  Note,
  Proposal,
  SkillCategory,
  User,
} from "./types";

/**
 * Supabase is optional. Without credentials the app serves seed data so every
 * screen is navigable; `supabase/schema.sql` holds the matching tables for when
 * you connect a real project.
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export function getCurrentUser(): User {
  return USERS.find((u) => u.id === CURRENT_USER_ID)!;
}

export function getUser(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}

export function getFreelancers(): User[] {
  return USERS.filter((u) => u.role === "freelancer");
}

export function getJobs(filters: { skills?: SkillCategory[]; query?: string } = {}): Job[] {
  let jobs = [...JOBS];
  if (filters.skills?.length) {
    jobs = jobs.filter((j) => j.skills.some((s) => filters.skills!.includes(s)));
  }
  if (filters.query) {
    const q = filters.query.toLowerCase();
    jobs = jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.summary.toLowerCase().includes(q) ||
        j.scope.toLowerCase().includes(q),
    );
  }
  return jobs.sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
  );
}

export function getJob(id: string): Job | undefined {
  return JOBS.find((j) => j.id === id);
}

export function getProposals(): Proposal[] {
  return [...PROPOSALS].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

export function getProposalsForUser(userId: string): Proposal[] {
  return getProposals().filter((p) => p.freelancerId === userId);
}

export function getProposalsForJob(jobId: string): Proposal[] {
  return getProposals().filter((p) => p.jobId === jobId);
}

export function getContracts(): Contract[] {
  return [...CONTRACTS];
}

export function getContractsForUser(userId: string): Contract[] {
  return CONTRACTS.filter(
    (c) => c.freelancerId === userId || c.clientId === userId,
  );
}

export function getContract(id: string): Contract | undefined {
  return CONTRACTS.find((c) => c.id === id);
}

export function getConversations(userId: string): Conversation[] {
  return CONVERSATIONS.filter((c) => c.participants.includes(userId)).sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );
}

export function getConversation(id: string): Conversation | undefined {
  return CONVERSATIONS.find((c) => c.id === id);
}

export function getMessages(conversationId: string): Message[] {
  return MESSAGES.filter((m) => m.conversationId === conversationId).sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
  );
}

export function getNotes(entityId: string): Note[] {
  return NOTES.filter((n) => n.entityId === entityId).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getDashboardStats(userId: string) {
  const contracts = getContractsForUser(userId);
  const active = contracts.filter((c) => c.status === "active");
  const proposals = getProposalsForUser(userId);

  const activeValue = active.reduce((sum, c) => sum + c.totalValue, 0);
  const paidToDate = contracts.reduce((sum, c) => sum + c.paidToDate, 0);
  const outstanding = activeValue - active.reduce((sum, c) => sum + c.paidToDate, 0);

  const openMilestones = active
    .flatMap((c) => c.milestones)
    .filter((m) => m.status === "active" || m.status === "submitted");

  const unread = getConversations(userId).reduce((sum, c) => sum + c.unreadCount, 0);

  return {
    activeContracts: active.length,
    activeValue,
    paidToDate,
    outstanding,
    openProposals: proposals.filter(
      (p) => p.status === "submitted" || p.status === "shortlisted",
    ).length,
    openMilestones,
    unreadMessages: unread,
  };
}

/* -------------------------------------------------------------------------
 * Agencies
 * ---------------------------------------------------------------------- */

export function getAgencies(filters: { skills?: SkillCategory[] } = {}): Agency[] {
  let agencies = [...AGENCIES];
  if (filters.skills?.length) {
    agencies = agencies.filter((a) =>
      a.skills.some((s) => filters.skills!.includes(s)),
    );
  }
  return agencies.sort((a, b) => b.rating - a.rating);
}

export function getAgency(id: string): Agency | undefined {
  return AGENCIES.find((a) => a.id === id);
}

/** Agencies this user belongs to, in any role. */
export function getAgenciesForUser(userId: string): Agency[] {
  return AGENCIES.filter((a) => a.members.some((m) => m.userId === userId));
}

export function getMembership(
  agencyId: string,
  userId: string,
): AgencyMember | undefined {
  return getAgency(agencyId)?.members.find((m) => m.userId === userId);
}

/** Members resolved to full user records, owner first. */
export function getRoster(agencyId: string) {
  const agency = getAgency(agencyId);
  if (!agency) return [];
  const rank = { owner: 0, admin: 1, member: 2 } as const;
  return agency.members
    .map((member) => ({ member, user: getUser(member.userId) }))
    .filter((r): r is { member: AgencyMember; user: User } => Boolean(r.user))
    .sort((a, b) => rank[a.member.role] - rank[b.member.role]);
}

export function getAgencyContracts(agencyId: string): Contract[] {
  return CONTRACTS.filter((c) => c.agencyId === agencyId);
}

/**
 * A member may act for the agency when they own or administer it. Plain
 * members appear on the roster and get paid, but cannot bid or change the team.
 */
export function canActForAgency(agencyId: string, userId: string): boolean {
  const role = getMembership(agencyId, userId)?.role;
  return role === "owner" || role === "admin";
}
