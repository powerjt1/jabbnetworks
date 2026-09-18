import type {
  Attachment,
  Contract,
  Conversation,
  Job,
  Message,
  Milestone,
  Note,
  Proposal,
  User,
} from "./types";

function att(
  id: string,
  name: string,
  size: number,
  kind: Attachment["kind"],
  uploadedBy: string,
  uploadedAt: string,
): Attachment {
  return { id, name, size, kind, uploadedBy, uploadedAt };
}

function ms(
  id: string,
  title: string,
  description: string,
  amount: number,
  dueDate: string,
  status: Milestone["status"],
  deliverables: string[],
): Milestone {
  return { id, title, description, amount, dueDate, status, deliverables };
}

export const USERS: User[] = [
  {
    id: "u_you",
    role: "freelancer",
    name: "Jordan Thorpe",
    title: "Power Platform & RPA Architect",
    avatarInitials: "JT",
    location: "Austin, TX",
    timezone: "America/Chicago",
    bio: "Twelve years automating enterprise back-office work. I take Nintex and legacy UiPath estates and land them on Power Platform without breaking the business. Certified on Power Platform Solution Architect and UiPath Advanced Developer.",
    skills: ["power-platform", "rpa", "uipath", "nintex-migration", "power-automate-desktop"],
    hourlyRate: 145,
    rating: 4.9,
    reviewCount: 63,
    jobsCompleted: 71,
    successRate: 98,
    verified: true,
    availability: "available",
    certifications: [
      "Microsoft Certified: Power Platform Solution Architect Expert",
      "UiPath Advanced RPA Developer",
      "Microsoft Certified: Azure Solutions Architect",
    ],
    joinedAt: "2021-03-14T00:00:00Z",
  },
  {
    id: "u_client_1",
    role: "client",
    name: "Priya Raman",
    title: "Director of Digital Operations",
    company: "Northwind Logistics",
    avatarInitials: "PR",
    location: "Chicago, IL",
    timezone: "America/Chicago",
    bio: "Running the automation programme for a 4,000-person logistics operator. We are mid-migration off Nintex and consolidating onto Power Platform.",
    skills: [],
    rating: 4.8,
    reviewCount: 24,
    jobsCompleted: 31,
    successRate: 96,
    verified: true,
    availability: "available",
    certifications: [],
    joinedAt: "2020-09-02T00:00:00Z",
  },
  {
    id: "u_client_2",
    role: "client",
    name: "Marcus Webb",
    title: "Head of IT",
    company: "Calder Health Group",
    avatarInitials: "MW",
    location: "Manchester, UK",
    timezone: "Europe/London",
    bio: "Healthcare group with 18 sites. Heavy SharePoint estate, strict compliance requirements, and a tenant consolidation on the roadmap.",
    skills: [],
    rating: 4.7,
    reviewCount: 12,
    jobsCompleted: 15,
    successRate: 93,
    verified: true,
    availability: "available",
    certifications: [],
    joinedAt: "2022-01-20T00:00:00Z",
  },
  {
    id: "u_client_3",
    role: "client",
    name: "Dana Okafor",
    title: "VP Engineering",
    company: "Meridian Financial",
    avatarInitials: "DO",
    location: "New York, NY",
    timezone: "America/New_York",
    bio: "Fintech scale-up. We need AI copilots wired into our internal tooling without leaking a single record of customer data.",
    skills: [],
    rating: 5.0,
    reviewCount: 8,
    jobsCompleted: 9,
    successRate: 100,
    verified: true,
    availability: "available",
    certifications: [],
    joinedAt: "2023-06-11T00:00:00Z",
  },
  {
    id: "u_free_2",
    role: "freelancer",
    name: "Sofia Lindqvist",
    title: "SharePoint & Migration Specialist",
    avatarInitials: "SL",
    location: "Stockholm, SE",
    timezone: "Europe/Stockholm",
    bio: "ShareGate power user. I have moved north of 40 TB of SharePoint content between tenants with zero permission drift.",
    skills: ["sharepoint", "sharegate", "msm-tools"],
    hourlyRate: 120,
    rating: 4.9,
    reviewCount: 41,
    jobsCompleted: 48,
    successRate: 99,
    verified: true,
    availability: "limited",
    certifications: ["Microsoft 365 Certified: Enterprise Administrator Expert"],
    joinedAt: "2021-11-05T00:00:00Z",
  },
  {
    id: "u_free_3",
    role: "freelancer",
    name: "Arjun Mehta",
    title: "AI Solutions Engineer",
    avatarInitials: "AM",
    location: "Bengaluru, IN",
    timezone: "Asia/Kolkata",
    bio: "I build retrieval pipelines and Copilot agents that survive contact with real enterprise data. Strong on evaluation and guardrails.",
    skills: ["ai-solutions", "web-apps", "power-platform"],
    hourlyRate: 110,
    rating: 4.8,
    reviewCount: 29,
    jobsCompleted: 34,
    successRate: 97,
    verified: true,
    availability: "available",
    certifications: ["Azure AI Engineer Associate"],
    joinedAt: "2022-04-18T00:00:00Z",
  },
  {
    id: "u_free_4",
    role: "freelancer",
    name: "Elena Vasquez",
    title: "UiPath & Process Automation Lead",
    avatarInitials: "EV",
    location: "Madrid, ES",
    timezone: "Europe/Madrid",
    bio: "REFramework purist. I inherit unstable bot estates and make them boring again.",
    skills: ["uipath", "rpa", "power-automate-desktop"],
    hourlyRate: 130,
    rating: 4.7,
    reviewCount: 35,
    jobsCompleted: 39,
    successRate: 95,
    verified: true,
    availability: "booked",
    certifications: ["UiPath Certified Professional Automation Developer"],
    joinedAt: "2021-07-29T00:00:00Z",
  },
];

export const CURRENT_USER_ID = "u_you";

export const JOBS: Job[] = [
  {
    id: "job_1",
    title: "Migrate 240 Nintex workflows to Power Automate",
    clientId: "u_client_1",
    status: "open",
    summary:
      "Full inventory, triage and conversion of a Nintex Workflow estate onto Power Automate, with parity testing and cutover runbooks.",
    scope: `We are decommissioning Nintex by the end of Q3 and need a partner to run the conversion end to end.

Current state:
- 240 published Nintex workflows across 31 SharePoint site collections
- Roughly 60% are simple approval or notification routes
- 40 are business-critical and touch our TMS via web service calls
- On-prem SharePoint 2016 for 4 legacy sites, everything else is SharePoint Online

What we need:
1. Inventory and complexity scoring of every workflow, with a recommendation to convert, consolidate or retire
2. Conversion of the approved set to Power Automate cloud flows, using solution-aware deployments
3. Parity test evidence for each converted flow, signed off by our process owners
4. Cutover runbook and a two-week hypercare window

Constraints:
- All flows must live in a managed solution and deploy through our existing ALM pipeline
- Service accounts only, no user-owned connections
- Data cannot leave the EU or US tenants it currently sits in

You will work alongside our internal platform team of three. We run fortnightly steering and expect a written status update every Friday.`,
    skills: ["nintex-migration", "power-platform", "sharepoint"],
    budgetType: "fixed",
    budgetMin: 48000,
    budgetMax: 72000,
    experienceLevel: "expert",
    estimatedDuration: "4-6 months",
    dueDate: "2026-12-19T00:00:00Z",
    postedAt: "2026-09-08T09:15:00Z",
    proposalCount: 11,
    featured: true,
    environments: ["PROD-EU", "PROD-US", "UAT", "DEV"],
    attachments: [
      att("a_1", "nintex-workflow-inventory.xlsx", 842_000, "sheet", "u_client_1", "2026-09-08T09:15:00Z"),
      att("a_2", "alm-pipeline-overview.pdf", 1_240_000, "pdf", "u_client_1", "2026-09-08T09:16:00Z"),
      att("a_3", "security-requirements.docx", 318_000, "doc", "u_client_1", "2026-09-08T09:18:00Z"),
    ],
    milestones: [
      ms("m_1", "Inventory & complexity scoring", "Every workflow catalogued with a convert/consolidate/retire call and effort estimate.", 12000, "2026-10-17T00:00:00Z", "pending", ["Inventory workbook", "Scoring rubric", "Recommendation deck"]),
      ms("m_2", "Wave 1 conversion — 140 simple flows", "Approval and notification routes converted and parity tested.", 22000, "2026-11-14T00:00:00Z", "pending", ["Managed solution package", "Parity test evidence"]),
      ms("m_3", "Wave 2 conversion — 40 critical flows", "TMS-integrated flows with full regression coverage.", 20000, "2026-12-12T00:00:00Z", "pending", ["Solution package", "Regression report", "Rollback plan"]),
      ms("m_4", "Cutover & hypercare", "Production cutover plus two weeks of hypercare support.", 8000, "2026-12-19T00:00:00Z", "pending", ["Cutover runbook", "Hypercare log"]),
    ],
  },
  {
    id: "job_2",
    title: "ShareGate tenant-to-tenant migration — 18 sites, 6 TB",
    clientId: "u_client_2",
    status: "open",
    summary:
      "Consolidate two Microsoft 365 tenants after an acquisition. SharePoint, Teams and OneDrive, with permission fidelity as the hard requirement.",
    scope: `We acquired a smaller health group last year and are finally collapsing their tenant into ours.

Scope:
- 18 SharePoint site collections, approximately 6 TB
- 340 OneDrive accounts
- 52 Teams with channel content and tabs
- Roughly 900 users to be merged into our identity estate

Hard requirements:
- Permission fidelity is non-negotiable — we are a regulated healthcare provider
- Migration waves must run outside 07:00-19:00 UK time
- Full audit trail for every object moved, retained for seven years
- Zero data residency change; everything stays in UK South

You will drive ShareGate, but we expect you to own the wave planning, the comms templates and the post-migration validation, not just the tooling.`,
    skills: ["sharegate", "sharepoint", "msm-tools"],
    budgetType: "fixed",
    budgetMin: 35000,
    budgetMax: 52000,
    experienceLevel: "expert",
    estimatedDuration: "3-4 months",
    dueDate: "2027-01-30T00:00:00Z",
    postedAt: "2026-09-11T14:02:00Z",
    proposalCount: 7,
    featured: true,
    environments: ["Source tenant", "Target tenant"],
    attachments: [
      att("a_4", "tenant-discovery-report.pdf", 2_100_000, "pdf", "u_client_2", "2026-09-11T14:02:00Z"),
      att("a_5", "wave-plan-draft.xlsx", 512_000, "sheet", "u_client_2", "2026-09-11T14:05:00Z"),
    ],
    milestones: [
      ms("m_5", "Discovery & wave plan", "Full source inventory and an agreed wave schedule.", 9000, "2026-10-10T00:00:00Z", "pending", ["Inventory report", "Wave schedule", "Comms templates"]),
      ms("m_6", "Pilot wave — 2 sites", "Prove the approach on two low-risk sites with full validation.", 8000, "2026-11-07T00:00:00Z", "pending", ["Pilot report", "Validation evidence"]),
      ms("m_7", "Production waves", "Remaining 16 sites, OneDrive and Teams content.", 24000, "2027-01-09T00:00:00Z", "pending", ["Migration logs", "Audit trail export"]),
      ms("m_8", "Validation & decommission", "Post-migration validation and source tenant decommission plan.", 5000, "2027-01-30T00:00:00Z", "pending", ["Validation report", "Decommission runbook"]),
    ],
  },
  {
    id: "job_3",
    title: "Build an internal Copilot agent over our policy library",
    clientId: "u_client_3",
    status: "open",
    summary:
      "RAG-backed assistant answering staff questions against 4,000 internal policy documents, with citations and strict data controls.",
    scope: `Our support and compliance teams burn hours a week hunting through policy PDFs. We want an internal assistant that answers in seconds with a citation.

Corpus:
- Approximately 4,000 documents, mostly PDF and DOCX
- Lives in SharePoint Online today
- Updated continuously; stale answers are worse than no answer

Requirements:
1. Retrieval pipeline with incremental re-indexing as documents change
2. Every answer must cite the source document and section
3. Refuses to answer when confidence is low rather than guessing
4. No customer PII may enter any model context — we will provide the classification rules
5. An evaluation harness we can run ourselves, with a regression set we own

Preference for Azure-native services. We are open on the front end — a Teams app or a web app both work, whichever you can defend.`,
    skills: ["ai-solutions", "web-apps", "sharepoint"],
    budgetType: "fixed",
    budgetMin: 40000,
    budgetMax: 65000,
    experienceLevel: "expert",
    estimatedDuration: "3-5 months",
    dueDate: "2027-02-27T00:00:00Z",
    postedAt: "2026-09-14T11:30:00Z",
    proposalCount: 14,
    featured: true,
    environments: ["Azure — prod", "Azure — dev"],
    attachments: [
      att("a_6", "data-classification-rules.pdf", 680_000, "pdf", "u_client_3", "2026-09-14T11:30:00Z"),
      att("a_7", "sample-policy-corpus.zip", 18_400_000, "zip", "u_client_3", "2026-09-14T11:34:00Z"),
    ],
    milestones: [
      ms("m_9", "Architecture & eval harness", "Agreed architecture plus a working evaluation harness and regression set.", 12000, "2026-10-24T00:00:00Z", "pending", ["Architecture decision record", "Eval harness", "Regression set"]),
      ms("m_10", "Retrieval pipeline", "Ingestion, chunking and incremental re-indexing in production.", 18000, "2026-12-05T00:00:00Z", "pending", ["Pipeline code", "Indexing runbook"]),
      ms("m_11", "Agent & front end", "Assistant with citations, refusal behaviour and the chosen UI.", 16000, "2027-01-30T00:00:00Z", "pending", ["Agent service", "Front end", "Eval results"]),
      ms("m_12", "Hardening & handover", "Security review, load testing and team handover.", 6000, "2027-02-27T00:00:00Z", "pending", ["Security review", "Runbooks", "Handover sessions"]),
    ],
  },
  {
    id: "job_4",
    title: "Stabilise a 60-bot UiPath estate",
    clientId: "u_client_1",
    status: "open",
    summary:
      "Inherit an unstable UiPath Orchestrator environment, refactor to REFramework and cut the failure rate below 2%.",
    scope: `Our bot estate was built fast and it shows. We are running at a 14% unattended failure rate and the team spends most of its week firefighting.

Current state:
- 60 processes in Orchestrator, 4 unattended robots
- Almost none follow REFramework
- Retry logic is inconsistent and selectors are brittle
- No meaningful logging standard

What success looks like:
- Failure rate under 2% sustained over 30 days
- Every process on a common framework with consistent logging
- A runbook the internal team can actually operate
- Knowledge transfer so we stop needing outside help

We would rather you refactor 20 processes properly than touch all 60 superficially. Tell us your triage approach in your proposal.`,
    skills: ["uipath", "rpa"],
    budgetType: "hourly",
    budgetMin: 110,
    budgetMax: 160,
    experienceLevel: "expert",
    estimatedDuration: "2-3 months",
    dueDate: "2026-12-05T00:00:00Z",
    postedAt: "2026-09-15T08:45:00Z",
    proposalCount: 9,
    featured: false,
    environments: ["Orchestrator PROD", "Orchestrator DEV"],
    attachments: [
      att("a_8", "orchestrator-failure-analysis.xlsx", 445_000, "sheet", "u_client_1", "2026-09-15T08:45:00Z"),
    ],
    milestones: [
      ms("m_13", "Triage & stabilisation plan", "Failure analysis and a prioritised refactor backlog.", 0, "2026-10-03T00:00:00Z", "pending", ["Failure analysis", "Refactor backlog"]),
      ms("m_14", "Refactor wave 1", "Top 20 processes moved onto REFramework.", 0, "2026-11-14T00:00:00Z", "pending", ["Refactored processes", "Test evidence"]),
      ms("m_15", "Handover", "Runbook and knowledge transfer sessions.", 0, "2026-12-05T00:00:00Z", "pending", ["Runbook", "Training sessions"]),
    ],
  },
  {
    id: "job_5",
    title: "Power Apps field inspection app with offline capture",
    clientId: "u_client_2",
    status: "open",
    summary:
      "Canvas app for site inspectors working in buildings with no signal. Offline capture, photo attachments, sync on reconnect.",
    scope: `Our estates team inspects 18 sites on a rolling schedule. Today it is paper forms transcribed later, badly.

Requirements:
- Canvas app, phone and tablet layouts
- Full offline capture — many plant rooms have no signal at all
- Photo capture with annotation, attached to the inspection record
- Conflict handling on sync, because two inspectors sometimes cover the same asset
- Dataverse backend, integrated with our existing asset register

Nice to have: a Power BI page for the estates manager showing overdue inspections by site.`,
    skills: ["power-platform", "web-apps"],
    budgetType: "fixed",
    budgetMin: 18000,
    budgetMax: 28000,
    experienceLevel: "intermediate",
    estimatedDuration: "6-10 weeks",
    dueDate: "2026-11-28T00:00:00Z",
    postedAt: "2026-09-16T16:20:00Z",
    proposalCount: 16,
    featured: false,
    environments: ["PROD", "UAT", "DEV"],
    attachments: [
      att("a_9", "current-inspection-form.pdf", 220_000, "pdf", "u_client_2", "2026-09-16T16:20:00Z"),
      att("a_10", "asset-register-schema.xlsx", 156_000, "sheet", "u_client_2", "2026-09-16T16:22:00Z"),
    ],
    milestones: [
      ms("m_16", "Design & data model", "Screen designs and the Dataverse schema signed off.", 5000, "2026-10-10T00:00:00Z", "pending", ["Screen designs", "Data model"]),
      ms("m_17", "App build", "Canvas app with offline capture and photo handling.", 13000, "2026-11-14T00:00:00Z", "pending", ["Canvas app", "Test plan"]),
      ms("m_18", "Rollout", "Pilot at two sites then full rollout.", 5000, "2026-11-28T00:00:00Z", "pending", ["Pilot report", "Training materials"]),
    ],
  },
  {
    id: "job_6",
    title: "Power Automate Desktop bots for invoice intake",
    clientId: "u_client_3",
    status: "open",
    summary:
      "Attended desktop flows that pull invoices from a legacy AS400 green screen and push them into our finance system.",
    scope: `Finance still keys invoices out of an AS400 terminal by hand. Roughly 400 a day.

The work:
- Attended Power Automate Desktop flows driving the terminal emulator
- OCR on the scanned invoice batch to pre-fill fields
- Validation rules before anything is committed
- Exception queue for anything the bot is not confident about

The AS400 is not going anywhere for at least three years, so we need this to be robust rather than clever. Prior terminal emulator automation experience matters here.`,
    skills: ["power-automate-desktop", "rpa", "ai-solutions"],
    budgetType: "fixed",
    budgetMin: 22000,
    budgetMax: 34000,
    experienceLevel: "intermediate",
    estimatedDuration: "2-3 months",
    dueDate: "2026-12-19T00:00:00Z",
    postedAt: "2026-09-17T10:05:00Z",
    proposalCount: 5,
    featured: false,
    environments: ["PROD", "DEV"],
    attachments: [
      att("a_11", "invoice-samples.zip", 8_200_000, "zip", "u_client_3", "2026-09-17T10:05:00Z"),
    ],
    milestones: [
      ms("m_19", "Proof of concept", "Terminal automation proven on 20 sample invoices.", 6000, "2026-10-17T00:00:00Z", "pending", ["PoC flow", "Results summary"]),
      ms("m_20", "Build & validation", "Full flow with OCR, validation and exception queue.", 20000, "2026-12-05T00:00:00Z", "pending", ["Desktop flows", "Validation rules"]),
      ms("m_21", "Go live", "Production rollout and finance team training.", 6000, "2026-12-19T00:00:00Z", "pending", ["Runbook", "Training"]),
    ],
  },
];

export const PROPOSALS: Proposal[] = [
  {
    id: "p_1",
    jobId: "job_1",
    freelancerId: "u_you",
    status: "shortlisted",
    bidAmount: 64000,
    budgetType: "fixed",
    estimatedDuration: "5 months",
    submittedAt: "2026-09-10T13:22:00Z",
    coverLetter: `I have run three Nintex decommissions of this shape, the largest at 310 workflows across a mixed on-prem and online estate.

The part most proposals will understate is the inventory. A raw export tells you what exists, not what matters. I score every workflow on business criticality, integration surface and conversion effort, then push hard on retirement — in my last engagement 28% of the estate was dead or duplicated and never needed converting at all. That is the cheapest wave you will ever run.

For the 40 TMS-integrated flows I would want a fortnight of discovery before committing to the wave 2 date. Web service calls out of Nintex tend to hide assumptions about state that do not survive the move to Power Automate.

Your ALM constraint is the right call and I work solution-first by default. Everything lands in a managed solution and deploys through your pipeline; I will not hand you unmanaged components.

Happy to walk through the parity testing approach on a call.`,
    milestones: [
      ms("pm_1", "Inventory & complexity scoring", "Full catalogue with convert/consolidate/retire calls.", 12000, "2026-10-17T00:00:00Z", "pending", ["Inventory workbook", "Scoring rubric"]),
      ms("pm_2", "Wave 1 — simple flows", "140 approval and notification routes converted.", 20000, "2026-11-14T00:00:00Z", "pending", ["Solution package", "Parity evidence"]),
      ms("pm_3", "Wave 2 — critical flows", "40 TMS-integrated flows with regression coverage.", 24000, "2026-12-12T00:00:00Z", "pending", ["Solution package", "Regression report"]),
      ms("pm_4", "Cutover & hypercare", "Cutover plus two weeks hypercare.", 8000, "2026-12-19T00:00:00Z", "pending", ["Runbook", "Hypercare log"]),
    ],
    attachments: [
      att("a_12", "nintex-migration-approach.pdf", 1_800_000, "pdf", "u_you", "2026-09-10T13:22:00Z"),
      att("a_13", "reference-case-study.pdf", 940_000, "pdf", "u_you", "2026-09-10T13:23:00Z"),
    ],
  },
  {
    id: "p_2",
    jobId: "job_4",
    freelancerId: "u_you",
    status: "submitted",
    bidAmount: 140,
    budgetType: "hourly",
    estimatedDuration: "10 weeks",
    submittedAt: "2026-09-16T09:10:00Z",
    coverLetter: `You asked for the triage approach, so here it is up front.

Week one I instrument before I touch anything. A 14% failure rate is an average hiding a distribution — in every estate I have inherited, a handful of processes generate most of the failures. I pull 90 days of Orchestrator logs, cluster failures by root cause rather than by process, and rank by business hours lost.

That ranking, not the process list, drives the refactor order. My experience is that roughly 15 processes will account for 70% of your pain. Fixing those properly gets you most of the way to the 2% target before we touch the long tail.

On REFramework: I will not religiously convert everything. Some of your 60 are simple enough that the framework adds ceremony without adding stability. I will tell you which ones those are rather than bill you to wrap them.

The knowledge transfer requirement is the part I would push you on. It only works if your team refactors alongside me from wave one, not in a handover week at the end. I would want two of your people in the code with me throughout.`,
    milestones: [
      ms("pm_5", "Instrumentation & triage", "90-day failure analysis clustered by root cause.", 0, "2026-10-03T00:00:00Z", "pending", ["Failure analysis", "Prioritised backlog"]),
      ms("pm_6", "Refactor wave 1", "Top 15 processes by business hours lost.", 0, "2026-11-14T00:00:00Z", "pending", ["Refactored processes", "Test evidence"]),
      ms("pm_7", "Handover", "Runbook plus paired refactoring throughout.", 0, "2026-12-05T00:00:00Z", "pending", ["Runbook", "Training"]),
    ],
    attachments: [],
  },
  {
    id: "p_3",
    jobId: "job_3",
    freelancerId: "u_free_3",
    status: "submitted",
    bidAmount: 58000,
    budgetType: "fixed",
    estimatedDuration: "4 months",
    submittedAt: "2026-09-15T07:40:00Z",
    coverLetter:
      "The refusal behaviour is the hard part of this brief and most teams treat it as an afterthought. I would build the eval harness first, before a single retrieval component, so we have a way to measure whether the thing is getting better.",
    milestones: [],
    attachments: [],
  },
  {
    id: "p_4",
    jobId: "job_2",
    freelancerId: "u_free_2",
    status: "accepted",
    bidAmount: 46000,
    budgetType: "fixed",
    estimatedDuration: "3 months",
    submittedAt: "2026-09-12T10:15:00Z",
    coverLetter:
      "Permission fidelity in a regulated environment is exactly the constraint I optimise for. I run a pre-flight permission diff and a post-migration diff on every wave, and I hand you both.",
    milestones: [],
    attachments: [],
  },
];

export const CONTRACTS: Contract[] = [
  {
    id: "c_1",
    jobId: "job_5",
    clientId: "u_client_2",
    freelancerId: "u_you",
    status: "active",
    totalValue: 23000,
    paidToDate: 5000,
    startedAt: "2026-08-04T00:00:00Z",
    dueDate: "2026-11-28T00:00:00Z",
    milestones: [
      ms("cm_1", "Design & data model", "Screen designs and Dataverse schema signed off by the estates team.", 5000, "2026-09-05T00:00:00Z", "paid", ["Screen designs", "Data model", "Sign-off"]),
      ms("cm_2", "App build", "Canvas app with offline capture, photo annotation and conflict handling.", 13000, "2026-10-31T00:00:00Z", "active", ["Canvas app", "Test plan", "Offline test evidence"]),
      ms("cm_3", "Rollout", "Pilot at Ashford and Calder Park, then full rollout across 18 sites.", 5000, "2026-11-28T00:00:00Z", "pending", ["Pilot report", "Training materials"]),
    ],
  },
  {
    id: "c_2",
    jobId: "job_6",
    clientId: "u_client_3",
    freelancerId: "u_you",
    status: "active",
    totalValue: 29000,
    paidToDate: 6000,
    startedAt: "2026-07-21T00:00:00Z",
    dueDate: "2026-12-19T00:00:00Z",
    milestones: [
      ms("cm_4", "Proof of concept", "Terminal automation proven against 20 sample invoices.", 6000, "2026-08-29T00:00:00Z", "paid", ["PoC flow", "Results summary"]),
      ms("cm_5", "Build & validation", "Full desktop flow with OCR pre-fill, validation rules and exception queue.", 17000, "2026-11-21T00:00:00Z", "submitted", ["Desktop flows", "Validation rules", "Exception queue"]),
      ms("cm_6", "Go live", "Production rollout and finance team training.", 6000, "2026-12-19T00:00:00Z", "pending", ["Runbook", "Training"]),
    ],
  },
  {
    id: "c_3",
    jobId: "job_1",
    clientId: "u_client_1",
    freelancerId: "u_you",
    status: "completed",
    totalValue: 14500,
    paidToDate: 14500,
    startedAt: "2026-03-02T00:00:00Z",
    dueDate: "2026-05-29T00:00:00Z",
    milestones: [
      ms("cm_7", "Discovery sprint", "Two-week discovery across the Nintex estate ahead of the main programme.", 14500, "2026-05-29T00:00:00Z", "paid", ["Discovery report", "Recommendation deck"]),
    ],
  },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: "cv_1",
    participants: ["u_you", "u_client_2"],
    jobId: "job_5",
    subject: "Field inspection app — offline sync",
    lastMessageAt: "2026-09-18T15:42:00Z",
    unreadCount: 2,
  },
  {
    id: "cv_2",
    participants: ["u_you", "u_client_1"],
    jobId: "job_1",
    subject: "Nintex migration — proposal follow-up",
    lastMessageAt: "2026-09-18T11:08:00Z",
    unreadCount: 0,
  },
  {
    id: "cv_3",
    participants: ["u_you", "u_client_3"],
    jobId: "job_6",
    subject: "Invoice intake — exception queue design",
    lastMessageAt: "2026-09-17T17:25:00Z",
    unreadCount: 1,
  },
];

export const MESSAGES: Message[] = [
  {
    id: "msg_1",
    conversationId: "cv_1",
    senderId: "u_client_2",
    body: "Jordan — the estates team tried the offline build at Calder Park this morning. Capture worked fine with no signal, but two inspectors hit the same asset and the sync produced a duplicate record rather than flagging a conflict.",
    sentAt: "2026-09-18T09:14:00Z",
    attachments: [],
  },
  {
    id: "msg_2",
    conversationId: "cv_1",
    senderId: "u_you",
    body: "That is the conflict path not firing rather than a sync bug. The duplicate detection keys on asset ID plus inspection date, and the second inspector's device had drifted about four minutes, so the records landed as separate dates.\n\nI will move the key onto the asset ID plus the scheduled slot rather than the capture timestamp. That removes the clock dependency entirely.",
    sentAt: "2026-09-18T10:02:00Z",
    attachments: [],
  },
  {
    id: "msg_3",
    conversationId: "cv_1",
    senderId: "u_client_2",
    body: "Makes sense. How much does that move the milestone date?",
    sentAt: "2026-09-18T10:20:00Z",
    attachments: [],
  },
  {
    id: "msg_4",
    conversationId: "cv_1",
    senderId: "u_you",
    body: "It does not — this is inside the build milestone and it is roughly a day of work including the test pass. I would rather fix the key now than ship a rollout on top of it.\n\nI have attached the revised conflict handling note so your team can see the logic before I commit it.",
    sentAt: "2026-09-18T10:41:00Z",
    attachments: [
      att("a_14", "conflict-handling-revision.pdf", 380_000, "pdf", "u_you", "2026-09-18T10:41:00Z"),
    ],
  },
  {
    id: "msg_5",
    conversationId: "cv_1",
    senderId: "u_client_2",
    body: "Read it, happy with the approach. One thing — can we get the overdue inspections Power BI page into the pilot rather than waiting for rollout? The estates manager is asking.",
    sentAt: "2026-09-18T15:42:00Z",
    attachments: [],
  },
  {
    id: "msg_6",
    conversationId: "cv_2",
    senderId: "u_client_1",
    body: "Your proposal was the only one that pushed back on the wave 2 date. The steering group liked that. Can you talk us through what you would want to see in the discovery fortnight before you would commit?",
    sentAt: "2026-09-17T16:30:00Z",
    attachments: [],
  },
  {
    id: "msg_7",
    conversationId: "cv_2",
    senderId: "u_you",
    body: "Three things, in order of how likely they are to hurt us.\n\nFirst, the actual contract of every web service call out of those 40 flows. Not the documentation — the live request and response. Nintex workflows accumulate assumptions about state that nobody wrote down.\n\nSecond, who owns the process on your side for each one. Parity testing needs a human who can say yes, that is what it used to do.\n\nThird, the retry and error behaviour when the TMS is slow. That is where converted flows usually break, and it never shows up in a happy-path test.\n\nGive me those and I will commit to a date I can hold.",
    sentAt: "2026-09-18T11:08:00Z",
    attachments: [],
  },
  {
    id: "msg_8",
    conversationId: "cv_3",
    senderId: "u_you",
    body: "Exception queue is built and I have run 200 invoices through it. Confidence thresholds are holding — 12 went to exceptions, and all 12 genuinely needed a human.\n\nOne decision for you: when the bot is unsure about a line item but confident on the header, do you want the whole invoice in the queue, or just the flagged line?",
    sentAt: "2026-09-17T14:50:00Z",
    attachments: [
      att("a_15", "exception-queue-results.xlsx", 290_000, "sheet", "u_you", "2026-09-17T14:50:00Z"),
    ],
  },
  {
    id: "msg_9",
    conversationId: "cv_3",
    senderId: "u_client_3",
    body: "Whole invoice. Finance will not trust a partial commit, and the review time difference is marginal at this volume.",
    sentAt: "2026-09-17T17:25:00Z",
    attachments: [],
  },
];

export const NOTES: Note[] = [
  {
    id: "n_1",
    entityId: "job_1",
    authorId: "u_you",
    body: "Priya mentioned the steering group meets fortnightly on Thursdays. Time the wave sign-offs to land the day before so approvals are not the blocker.",
    createdAt: "2026-09-18T11:15:00Z",
    pinned: true,
  },
  {
    id: "n_2",
    entityId: "job_1",
    authorId: "u_you",
    body: "Four legacy sites are still SharePoint 2016 on-prem. Confirm whether those workflows are in scope or being retired with the platform — materially changes wave 2 effort.",
    createdAt: "2026-09-12T08:30:00Z",
    pinned: false,
  },
  {
    id: "n_3",
    entityId: "c_1",
    authorId: "u_you",
    body: "Clock drift caused the duplicate records at Calder Park, not the sync logic. Re-keying on scheduled slot. Worth checking whether any other device-time assumptions are baked into the app.",
    createdAt: "2026-09-18T10:45:00Z",
    pinned: true,
  },
  {
    id: "n_4",
    entityId: "c_2",
    authorId: "u_you",
    body: "Dana wants whole-invoice exceptions rather than line-level. Simplifies the queue UI — drop the partial-commit path before the build milestone closes.",
    createdAt: "2026-09-17T17:40:00Z",
    pinned: true,
  },
];
