import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, opts: { compact?: boolean } = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: opts.compact ? "compact" : "standard",
  }).format(amount);
}

export function formatBudget(
  min: number,
  max: number,
  type: "fixed" | "hourly",
) {
  if (type === "hourly") {
    return `${formatCurrency(min)}–${formatCurrency(max)}/hr`;
  }
  return `${formatCurrency(min, { compact: true })}–${formatCurrency(max, { compact: true })}`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

/** Fixed reference point so seed data renders deterministically. */
const NOW = new Date("2026-09-18T18:00:00Z");

export function relativeTime(iso: string) {
  const then = new Date(iso);
  const diff = NOW.getTime() - then.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(months / 12)}y ago`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Negative when the date has passed. */
export function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - NOW.getTime();
  return Math.ceil(diff / 86400000);
}

export function dueLabel(iso: string) {
  const days = daysUntil(iso);
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, tone: "danger" as const };
  if (days === 0) return { text: "Due today", tone: "danger" as const };
  if (days <= 7) return { text: `Due in ${days}d`, tone: "warn" as const };
  return { text: `Due ${formatDate(iso)}`, tone: "muted" as const };
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
