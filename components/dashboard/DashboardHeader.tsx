/**
 * components/dashboard/DashboardHeader.tsx — Top header bar for the dashboard
 *
 * "use client" for dynamic greeting based on time of day.
 * Shows breadcrumb-style page title, search hint, and notifications placeholder.
 */

"use client";

import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Bell, Search } from "lucide-react";

// Map route prefixes to human-readable page titles
const PAGE_TITLES: Record<string, string> = {
  "/dashboard":                  "Overview",
  "/dashboard/profile":          "My Profile",
  "/dashboard/members":          "Member Directory",
  "/dashboard/members/manage":   "Manage Members",
  "/dashboard/analytics":        "Analytics",
  "/dashboard/settings":         "Settings",
};

function getPageTitle(pathname: string): string {
  // Longest prefix match
  const match = Object.keys(PAGE_TITLES)
    .filter((key) => pathname === key || pathname.startsWith(key + "/"))
    .sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_TITLES[match] : "Dashboard";
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function DashboardHeader() {
  const pathname = usePathname();
  const { user } = useUser();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="flex items-center justify-between px-6 lg:px-8 py-4
                       border-b border-surface-border bg-surface/60 backdrop-blur-sm
                       sticky top-0 z-10">
      {/* ── Page Title ───────────────────────────────────────────── */}
      <div>
        <h2 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
          {pageTitle}
        </h2>
      </div>

      {/* ── Actions ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Search hint (wire up to a real search modal later) */}
        <button
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg
                     bg-white/5 border border-surface-border text-gray-500
                     text-sm hover:bg-white/10 hover:text-gray-300 transition-all"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
          <span>Search…</span>
          <kbd className="text-xs bg-white/10 px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Notifications placeholder */}
        <button
          className="relative p-2 rounded-lg text-gray-400 hover:text-white
                     hover:bg-white/5 border border-transparent
                     hover:border-surface-border transition-all"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          {/* Unread indicator dot */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full
                           bg-brand-500 border-2 border-surface-card animate-pulse" />
        </button>
      </div>
    </header>
  );
}
