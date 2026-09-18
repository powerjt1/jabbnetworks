import type {
  ContractStatus,
  JobStatus,
  MilestoneStatus,
  ProposalStatus,
} from "./types";

type Tone = "neutral" | "brand" | "positive" | "caution" | "danger";

export const MILESTONE_TONE: Record<MilestoneStatus, Tone> = {
  pending: "neutral",
  active: "brand",
  submitted: "caution",
  approved: "positive",
  paid: "positive",
};

export const PROPOSAL_TONE: Record<ProposalStatus, Tone> = {
  submitted: "neutral",
  shortlisted: "brand",
  accepted: "positive",
  declined: "danger",
  withdrawn: "neutral",
};

export const CONTRACT_TONE: Record<ContractStatus, Tone> = {
  active: "brand",
  paused: "caution",
  completed: "positive",
  cancelled: "danger",
};

export const JOB_TONE: Record<JobStatus, Tone> = {
  draft: "neutral",
  open: "positive",
  in_review: "caution",
  awarded: "brand",
  closed: "neutral",
};

export const MILESTONE_LABEL: Record<MilestoneStatus, string> = {
  pending: "Pending",
  active: "In progress",
  submitted: "Awaiting approval",
  approved: "Approved",
  paid: "Paid",
};
