"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  Settings,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Find work", icon: Briefcase },
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/contracts", label: "Contracts", icon: ScrollText },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/meetings", label: "Meetings", icon: Video },
  { href: "/payments", label: "Payments", icon: Wallet },
  { href: "/talent", label: "Talent", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({ unread }: { unread: number }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-0.5">
      {NAV.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-brand/12 font-medium text-brand-soft"
                : "text-ink-2 hover:bg-surface-2 hover:text-ink",
            )}
          >
            <item.icon className="size-4 shrink-0" />
            <span className="flex-1">{item.label}</span>
            {item.href === "/messages" && unread > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-xs font-medium text-white tabular-nums">
                {unread}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
