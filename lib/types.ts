export type Role = "client" | "freelancer";

export type SkillCategory =
  | "power-platform"
  | "power-automate-desktop"
  | "ai-solutions"
  | "web-apps"
  | "rpa"
  | "uipath"
  | "nintex-migration"
  | "sharepoint"
  | "sharegate"
  | "msm-tools";

export type JobStatus = "draft" | "open" | "in_review" | "awarded" | "closed";
export type ProposalStatus = "submitted" | "shortlisted" | "accepted" | "declined" | "withdrawn";
export type ContractStatus = "active" | "paused" | "completed" | "cancelled";
export type MilestoneStatus = "pending" | "active" | "submitted" | "approved" | "paid";
export type BudgetType = "fixed" | "hourly";
export type ExperienceLevel = "entry" | "intermediate" | "expert";

export interface Skill {
  id: SkillCategory;
  label: string;
  blurb: string;
  /** Tailwind accent token key — see lib/skills.ts */
  tone: "blue" | "violet" | "emerald" | "amber" | "rose" | "cyan";
}

export interface Attachment {
  id: string;
  name: string;
  /** Bytes. Rendered via formatBytes(). */
  size: number;
  kind: "pdf" | "image" | "doc" | "sheet" | "zip" | "other";
  uploadedAt: string;
  uploadedBy: string;
}

export interface User {
  id: string;
  role: Role;
  name: string;
  title: string;
  company?: string;
  avatarInitials: string;
  location: string;
  timezone: string;
  bio: string;
  skills: SkillCategory[];
  hourlyRate?: number;
  rating: number;
  reviewCount: number;
  jobsCompleted: number;
  /** Percentage, 0-100 */
  successRate: number;
  verified: boolean;
  availability: "available" | "limited" | "booked";
  certifications: string[];
  joinedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: MilestoneStatus;
  deliverables: string[];
}

export interface Job {
  id: string;
  title: string;
  clientId: string;
  status: JobStatus;
  /** The long-form job scope, markdown-ish plain text. */
  scope: string;
  summary: string;
  skills: SkillCategory[];
  budgetType: BudgetType;
  budgetMin: number;
  budgetMax: number;
  experienceLevel: ExperienceLevel;
  estimatedDuration: string;
  dueDate: string;
  postedAt: string;
  proposalCount: number;
  attachments: Attachment[];
  milestones: Milestone[];
  /** Screens / environments the work touches — Power Platform specific. */
  environments: string[];
  featured: boolean;
}

export type AgencyRole = "owner" | "admin" | "member";

export interface AgencyMember {
  userId: string;
  role: AgencyRole;
  /** Role on this agency's work, which need not match their public title. */
  title: string;
  joinedAt: string;
}

export interface Agency {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  avatarInitials: string;
  location: string;
  foundedAt: string;
  /** Union of what the roster can deliver. */
  skills: SkillCategory[];
  members: AgencyMember[];
  rating: number;
  reviewCount: number;
  contractsCompleted: number;
  verified: boolean;
  /** Blended day rate in USD, for work priced by time. */
  dayRate: number;
  /**
   * Where released milestone money lands. The agency is paid as one party and
   * splits internally — see `assignments` on a proposal.
   */
  stripeAccountId?: string;
}

/**
 * Who on the roster is actually doing the work, named at proposal time.
 *
 * On a six-figure migration the client is buying specific people, not a logo.
 * An agency bid that will not say who is staffing it is the thing clients
 * complain about most, so the roster is part of the offer rather than a
 * detail settled after signature.
 */
export interface Assignment {
  userId: string;
  /** What they are doing on this contract. */
  role: string;
  /** Share of the contract value, in basis points. Must total 10,000. */
  splitBps: number;
}

export interface Proposal {
  id: string;
  jobId: string;
  freelancerId: string;
  /** Set when the bid comes from an agency rather than an individual. */
  agencyId?: string;
  /** Named roster for an agency bid, and how the money divides. */
  assignments?: Assignment[];
  status: ProposalStatus;
  coverLetter: string;
  bidAmount: number;
  budgetType: BudgetType;
  estimatedDuration: string;
  submittedAt: string;
  milestones: Milestone[];
  attachments: Attachment[];
}

export interface Contract {
  id: string;
  jobId: string;
  clientId: string;
  freelancerId: string;
  /** Set when an agency holds the contract; freelancerId is then its lead. */
  agencyId?: string;
  assignments?: Assignment[];
  status: ContractStatus;
  totalValue: number;
  paidToDate: number;
  startedAt: string;
  dueDate: string;
  milestones: Milestone[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  sentAt: string;
  attachments: Attachment[];
}

export interface Conversation {
  id: string;
  /** Participant user ids. */
  participants: string[];
  jobId?: string;
  subject: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Note {
  id: string;
  /** Job, contract or user id this note is pinned to. */
  entityId: string;
  authorId: string;
  body: string;
  createdAt: string;
  pinned: boolean;
}
