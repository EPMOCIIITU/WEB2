"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import {
  ArrowLeft,
  BookUser,
  Building2,
  CalendarPlus,
  LayoutDashboard,
  Settings,
  ClipboardList,
  User,
  BarChart3,
  LogOut,
  CalendarDays,
  ChevronLeft,
} from "lucide-react";
import type { UserRole } from "@/lib/roles";
import { ROLE_COLORS, ROLE_LABELS } from "@/lib/roles";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Assign Tasks",
    href: "/dashboard/tasks",
    icon: ClipboardList,
    roles: ["president", "core"],
    description: "Assign and review work",
  },
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["president", "core", "member"],
    description: "Dashboard home",
  },
  {
    label: "All Members",
    href: "/dashboard/members",
    icon: BookUser,
    roles: ["president", "core", "member"],
    description: "Browse all members",
  },
  {
    label: "Departments",
    href: "/dashboard/departments",
    icon: Building2,
    roles: ["president", "core", "member"],
    description: "Department sections",
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["president", "core"],
    description: "Club statistics",
  },
  {
    label: "Events",
    href: "/dashboard/events",
    icon: CalendarDays,
    roles: ["president", "core"],
    description: "Manage events",
  },
  {
    label: "Add Event",
    href: "/dashboard/events/new",
    icon: CalendarPlus,
    roles: ["president", "core"],
    description: "Create a new event",
  },
  {
    label: "My Profile",
    href: "/dashboard/profile",
    icon: User,
    roles: ["president", "core", "member"],
    description: "View profile details",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["president"],
    description: "Manage club settings",
  },
];

interface DashboardSidebarProps {
  role: UserRole;
  fullName: string;
  designation: string;
  imageUrl: string | null;
}

export function DashboardSidebar({
  role,
  fullName,
  designation,
  imageUrl,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-300",
          collapsed ? "w-20" : "w-72"
        )}
      >
        {/* Header: Logo + collapse toggle */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2 group px-1">
              <img src="/epmoc-logo.png" alt="EPMOC Logo" className="h-8 w-auto object-contain transition-opacity group-hover:opacity-80" />
            </Link>
          )}
          {collapsed && (
            <div className="mx-auto flex justify-center">
              <img src="/epmoc-logo.png" alt="EPMOC Logo" className="h-8 w-auto object-contain" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              className={cn(
                "w-4 h-4 transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* User profile block */}
        {!collapsed && (
          <div className="border-b border-slate-200 px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-50 flex-shrink-0">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={fullName}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-500 font-bold text-sm">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{fullName}</p>
                <p className="text-xs text-slate-500 truncate">{designation}</p>
              </div>
            </div>
            <span className={cn("role-badge mt-3", ROLE_COLORS[role])}>
              {ROLE_LABELS[role]}
            </span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {visibleItems.map(({ label, href, icon: Icon, description }) => {
            const isActive =
              href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isActive ? "text-white" : "text-slate-400"
                  )}
                />
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <span className="block truncate">{label}</span>
                    {isActive && (
                      <span className="block truncate text-[10px] opacity-60 mt-0.5">
                        {description}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 px-3 py-3 space-y-2">
          <Link
            href="/"
            title={collapsed ? "Back to Home" : undefined}
            className={cn(
              "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium",
              "text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-150",
              collapsed && "justify-center px-2"
            )}
          >
            <ArrowLeft className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Back to Home</span>}
          </Link>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className={cn(
              "flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium",
              "text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all duration-150",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar handled by DashboardHeader hamburger */}
    </>
  );
}
