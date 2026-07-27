"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BookUser,
  Building2,
  CalendarPlus,
  LayoutDashboard,
  Settings,
  ClipboardList,
  User,
} from "lucide-react";
import type { UserRole } from "@/lib/roles";
import { ROLE_COLORS, ROLE_LABELS } from "@/lib/roles";
import { cn } from "@/lib/utils";

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
    description: "Blank landing area",
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
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="flex h-screen w-80 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={fullName}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                <User className="h-8 w-8" />
              </div>
            )}
          </div>
          <p className="mt-4 text-lg font-semibold text-slate-900">{fullName}</p>
          <p className="mt-1 text-sm text-slate-500">{designation}</p>
          <span className={cn("role-badge mt-4", ROLE_COLORS[role])}>
            {ROLE_LABELS[role]}
          </span>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
        {visibleItems.map(({ label, href, icon: Icon, description }) => {
          const isActive = href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-white" : "text-slate-400")} />
              <div className="min-w-0 flex-1">
                <span className="block truncate">{label}</span>
                {isActive && <span className="block truncate text-[10px] text-current/70">{description}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </aside>
  );
}
