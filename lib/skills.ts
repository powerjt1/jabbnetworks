import type { Skill, SkillCategory } from "./types";

export const SKILLS: Skill[] = [
  {
    id: "power-platform",
    label: "Power Platform",
    blurb: "Power Apps, Dataverse, Power BI and Power Pages builds",
    tone: "violet",
  },
  {
    id: "power-automate-desktop",
    label: "Power Automate Desktop",
    blurb: "Attended and unattended desktop flow automation",
    tone: "violet",
  },
  {
    id: "ai-solutions",
    label: "AI Solutions",
    blurb: "Copilot agents, RAG pipelines and document intelligence",
    tone: "cyan",
  },
  {
    id: "web-apps",
    label: "Web Applications",
    blurb: "Custom portals, dashboards and line-of-business apps",
    tone: "blue",
  },
  {
    id: "rpa",
    label: "RPA",
    blurb: "Process discovery, bot development and orchestration",
    tone: "emerald",
  },
  {
    id: "uipath",
    label: "UiPath",
    blurb: "Studio, Orchestrator and REFramework delivery",
    tone: "emerald",
  },
  {
    id: "nintex-migration",
    label: "Nintex Migration",
    blurb: "Nintex to Power Automate workflow conversion",
    tone: "amber",
  },
  {
    id: "sharepoint",
    label: "SharePoint",
    blurb: "SPO architecture, governance and custom solutions",
    tone: "blue",
  },
  {
    id: "sharegate",
    label: "ShareGate",
    blurb: "Tenant-to-tenant migration and content reshaping",
    tone: "rose",
  },
  {
    id: "msm-tools",
    label: "MSM Tools",
    blurb: "Microsoft migration and management tooling",
    tone: "rose",
  },
];

const SKILL_MAP = new Map(SKILLS.map((s) => [s.id, s]));

export function getSkill(id: SkillCategory): Skill {
  const skill = SKILL_MAP.get(id);
  if (!skill) throw new Error(`Unknown skill: ${id}`);
  return skill;
}

export const TONE_CLASSES: Record<Skill["tone"], string> = {
  blue: "bg-blue-500/10 text-blue-300 ring-blue-500/25",
  violet: "bg-violet-500/10 text-violet-300 ring-violet-500/25",
  emerald: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/25",
  amber: "bg-amber-500/10 text-amber-300 ring-amber-500/25",
  rose: "bg-rose-500/10 text-rose-300 ring-rose-500/25",
  cyan: "bg-cyan-500/10 text-cyan-300 ring-cyan-500/25",
};
