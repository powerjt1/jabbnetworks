"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui";
import { SKILLS, TONE_CLASSES } from "@/lib/skills";
import type { SkillCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

export function JobFilters({
  selected,
  query,
}: {
  selected: SkillCategory[];
  query: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function apply(next: URLSearchParams) {
    const qs = next.toString();
    router.push(qs ? `/jobs?${qs}` : "/jobs");
  }

  function toggleSkill(id: SkillCategory) {
    const next = new URLSearchParams(searchParams.toString());
    const current = next.getAll("skill");
    next.delete("skill");
    const updated = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    updated.forEach((s) => next.append("skill", s));
    apply(next);
  }

  function onSearch(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set("q", value);
    else next.delete("q");
    apply(next);
  }

  const hasFilters = selected.length > 0 || query.length > 0;

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          onSearch(String(data.get("q") ?? ""));
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-3" />
        <Input
          name="q"
          defaultValue={query}
          placeholder="Search scopes — Nintex, ShareGate, offline capture…"
          className="pl-9"
        />
      </form>

      <div className="flex flex-wrap items-center gap-1.5">
        {SKILLS.map((skill) => {
          const active = selected.includes(skill.id);
          return (
            <button
              key={skill.id}
              type="button"
              onClick={() => toggleSkill(skill.id)}
              aria-pressed={active}
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
        {hasFilters && (
          <button
            type="button"
            onClick={() => router.push("/jobs")}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-ink-3 transition-colors hover:text-ink"
          >
            <X className="size-3" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
