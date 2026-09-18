import Link from "next/link";
import { Plus } from "lucide-react";
import { SidebarNav } from "@/components/sidebar";
import { Avatar, ButtonLink } from "@/components/ui";
import { getCurrentUser, getDashboardStats, isSupabaseConfigured } from "@/lib/data";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = getCurrentUser();
  const stats = getDashboardStats(user.id);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-line-soft bg-surface/40 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0">
        <div className="flex h-full flex-col gap-6 p-4">
          <Link href="/" className="flex items-center gap-2.5 px-2">
            <span className="grid size-8 place-items-center rounded-lg bg-brand font-bold text-white">
              J
            </span>
            <span className="font-semibold tracking-tight">JABB Networks</span>
          </Link>

          <ButtonLink href="/jobs/new" size="sm" className="w-full">
            <Plus className="size-4" />
            Post a job
          </ButtonLink>

          <SidebarNav unread={stats.unreadMessages} />

          <div className="mt-auto space-y-3">
            {!isSupabaseConfigured && (
              <div className="rounded-lg border border-caution/25 bg-caution/8 p-3">
                <p className="text-xs font-medium text-caution">Demo data</p>
                <p className="mt-1 text-xs text-ink-3">
                  Add Supabase keys to <code className="font-mono">.env.local</code>{" "}
                  to switch to a live database.
                </p>
              </div>
            )}
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2"
            >
              <Avatar initials={user.avatarInitials} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-ink-3">{user.title}</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      <main className="min-w-0">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
