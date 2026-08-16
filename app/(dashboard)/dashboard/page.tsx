/**
 * app/(dashboard)/dashboard/page.tsx — Dashboard Overview
 *
 * Role-aware landing page: quick stats, action cards, recent members.
 */

import { MyTasks } from "@/components/dashboard/TaskWorkspace";
import { requirePermission, getCurrentUserRole } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import { formatDate } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import {
  Users,
  UserCheck,
  Building2,
  CalendarDays,
  ArrowRight,
  BarChart3,
  UserPlus,
  Crown,
  Code,
  Megaphone,
  HeartHandshake,
  Palette,
  Camera,
  Share2,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard Overview" };

const DEPT_ICONS: Record<string, typeof Building2> = {
  Technical: Code,
  PR: Megaphone,
  Volunteering: HeartHandshake,
  Designing: Palette,
  Coverage: Camera,
  "Social Media": Share2,
};

async function getOverviewData() {
  await connectDB();
  const [totalMembers, activeMembers, recentMembers, deptStats] =
    await Promise.all([
      Member.countDocuments({}),
      Member.countDocuments({ isActive: true }),
      Member.find({}).sort({ createdAt: -1 }).limit(6).lean(),
      Member.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 3 },
      ]),
    ]);
  return { totalMembers, activeMembers, recentMembers, deptStats };
}

export default async function DashboardOverviewPage() {
  await requirePermission("view_directory");

  const user = await currentUser();
  const role = await getCurrentUserRole();

  let data = {
    totalMembers: 0,
    activeMembers: 0,
    recentMembers: [] as Awaited<ReturnType<typeof getOverviewData>>["recentMembers"],
    deptStats: [] as { _id: string; count: number }[],
  };

  try {
    data = await getOverviewData();
  } catch {
    // DB not connected — show zeros
  }

  const firstName = user?.firstName ?? user?.fullName?.split(" ")[0] ?? "there";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Welcome Banner ──────────────────────────────────────── */}
      <div className="rounded-2xl bg-slate-900 px-8 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm mb-1">{greeting} 👋</p>
          <h1 className="font-display text-2xl font-bold text-white">
            Welcome back, {firstName}!
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Here&apos;s what&apos;s happening with EPMOC today.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {(role === "president" || role === "core") && (
            <Link href="/dashboard/members/manage" className="btn-secondary border-slate-600 text-black hover:bg-slate-800 hover:text-white">
              <UserPlus className="w-4 h-4" />
              Manage Members
            </Link>
          )}
          <Link href="/dashboard/members" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-all">
            View Directory
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
        {[
          {
            label: "Total Members",
            value: data.totalMembers,
            icon: Users,
          },
          {
            label: "Active Members",
            value: data.activeMembers,
            icon: UserCheck,
          },
          {
            label: "Departments",
            value: 6,
            icon: Building2,
          },
          {
            label: "Pending Approval",
            value: data.totalMembers - data.activeMembers,
            icon: CalendarDays,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-6 flex flex-col items-center justify-center text-center gap-1.5 hover:shadow-md transition-all">
            <Icon className="w-6 h-6 text-indigo-500 mb-1" />
            <span className="text-3xl font-extrabold font-display text-slate-900">
              {value}
            </span>
            <span className="text-sm font-medium text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Quick Actions (role-gated) ───────────────────────────── */}
      <MyTasks />

      {(role === "president" || role === "core") && (
        <section>
          <h2 className="font-display text-lg font-semibold text-slate-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: UserPlus,
                title: "Add Member",
                desc: "Register a new club member",
                href: "/dashboard/members/manage",
                color: "text-indigo-500",
                bg: "bg-indigo-50",
              },
              {
                icon: BarChart3,
                title: "View Analytics",
                desc: "Membership stats & charts",
                href: "/dashboard/analytics",
                color: "text-violet-500",
                bg: "bg-violet-50",
              },
              {
                icon: CalendarDays,
                title: "Create Event",
                desc: "Add an upcoming event",
                href: "/dashboard/events/new",
                color: "text-emerald-500",
                bg: "bg-emerald-50",
              },
              ...(role === "president"
                ? [
                    {
                      icon: Crown,
                      title: "Manage Members",
                      desc: "Edit roles and statuses",
                      href: "/dashboard/members/manage",
                      color: "text-amber-500",
                      bg: "bg-amber-50",
                    },
                  ]
                : []),
            ].map(({ icon: Icon, title, desc, href, color, bg }) => (
              <Link
                key={href + title}
                href={href}
                className="card p-5 flex items-center gap-4 hover:shadow-sm hover:border-slate-300 transition-all group"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg} flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    {title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 ml-auto flex-shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Top Departments ─────────────────────────────────────── */}
      {data.deptStats.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              Top Departments
            </h2>
            <Link
              href="/dashboard/departments"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {data.deptStats.map(({ _id, count }) => {
              const Icon = DEPT_ICONS[_id] ?? Building2;
              return (
                <div key={_id} className="card p-6 flex flex-col items-center justify-center text-center gap-1.5 hover:shadow-md transition-all">
                  <Icon className="w-6 h-6 text-indigo-500 mb-1" />
                  <span className="text-3xl font-extrabold font-display text-slate-900">
                    {count}
                  </span>
                  <span className="text-sm font-medium text-slate-500">{_id}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Recent Members ──────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Recent Members
          </h2>
          <Link
            href="/dashboard/members"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="card overflow-hidden">
          {data.recentMembers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No members yet — run{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                npm run seed
              </code>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentMembers.map((member) => (
                <Link
                  key={String(member._id)}
                  href={`/dashboard/members/${String(member._id)}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                      {member.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {member.department} · {member.branch} · Year {member.year}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs text-slate-400">
                      {formatDate(member.createdAt)}
                    </span>
                    <p className="text-xs text-slate-500 capitalize mt-0.5">
                      {member.designation}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
