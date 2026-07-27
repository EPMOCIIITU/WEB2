/**
 * app/(dashboard)/dashboard/departments/page.tsx — Departments Page
 *
 * Shows all club departments with member counts and member lists.
 */

import { requirePermission } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import type { MemberDepartment } from "@/models/Member";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Building2,
  Users,
  Palette,
  Megaphone,
  Share2,
  HandHeart,
  Camera,
  Code2,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Departments" };

const DEPT_META: Record<
  MemberDepartment,
  {
    icon: React.ElementType;
    color: string;
    bg: string;
    border: string;
    description: string;
  }
> = {
  Designing: {
    icon: Palette,
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    description: "Visual design, branding, and creative assets for the club.",
  },
  PR: {
    icon: Megaphone,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    description: "Public relations, sponsorships, and external communications.",
  },
  "Social Media": {
    icon: Share2,
    color: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    description: "Managing the club's online presence and content calendar.",
  },
  Volunteering: {
    icon: HandHeart,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    description: "Event volunteers, logistics, and on-ground coordination.",
  },
  Coverage: {
    icon: Camera,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    description: "Photography, videography, and event documentation.",
  },
  Technical: {
    icon: Code2,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    description: "Tech platforms, website, and digital infrastructure.",
  },
};

async function getDepartmentData() {
  await connectDB();
  const members = await Member.find({}).sort({ designation: 1, name: 1 }).lean();

  const grouped: Record<string, typeof members> = {};
  for (const m of members) {
    if (!grouped[m.department]) grouped[m.department] = [];
    grouped[m.department].push(m);
  }
  return grouped;
}

export default async function DepartmentsPage() {
  await requirePermission("view_directory");

  let grouped: Record<string, Awaited<ReturnType<typeof getDepartmentData>>[string]> = {};
  try {
    grouped = await getDepartmentData();
  } catch {
    // DB offline
  }

  const departments = Object.keys(DEPT_META) as MemberDepartment[];
  const totalMembers = Object.values(grouped).reduce((s, arr) => s + arr.length, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-indigo-500" />
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Departments
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            {totalMembers} member{totalMembers !== 1 ? "s" : ""} across {departments.length} departments
          </p>
        </div>
      </div>

      {/* Department cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {departments.map((dept) => {
          const meta = DEPT_META[dept];
          const Icon = meta.icon;
          const deptMembers = grouped[dept] ?? [];

          return (
            <div
              key={dept}
              className={`card border ${meta.border} overflow-hidden`}
            >
              {/* Dept header */}
              <div className={`px-6 py-5 ${meta.bg} border-b ${meta.border}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${meta.color}`} />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-slate-900">
                        {dept}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {meta.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-semibold text-slate-700">
                      {deptMembers.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Member list */}
              <div className="divide-y divide-slate-100">
                {deptMembers.length === 0 ? (
                  <p className="px-6 py-6 text-sm text-slate-400 text-center">
                    No members in this department yet.
                  </p>
                ) : (
                  deptMembers.slice(0, 5).map((member) => (
                    <Link
                      key={String(member._id)}
                      href={`/dashboard/members/${String(member._id)}`}
                      className="flex items-center gap-3 px-6 py-3.5 hover:bg-slate-50 transition-colors group"
                    >
                      <div className={`w-8 h-8 rounded-full ${meta.bg} flex items-center justify-center text-sm font-bold ${meta.color} flex-shrink-0`}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors">
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {member.branch} · Year {member.year}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 capitalize flex-shrink-0">
                        {member.designation}
                      </span>
                    </Link>
                  ))
                )}
                {deptMembers.length > 5 && (
                  <Link
                    href="/dashboard/members"
                    className="flex items-center justify-center gap-1 px-6 py-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    +{deptMembers.length - 5} more members
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}