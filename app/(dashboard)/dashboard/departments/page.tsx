/**
 * app/(dashboard)/dashboard/departments/page.tsx — Departments Overview
 *
 * Shows one card per department with:
 *   - Department name + icon
 *   - Designated head (from DepartmentHead collection) with avatar
 *   - Active member count
 *
 * Head data now comes from the DepartmentHead collection, not from a
 * heuristic lookup on designation === "Head".
 *
 * Clicking a card navigates to /dashboard/members?department=<name>
 * which pre-applies the department filter in the Member Directory table.
 */

import { requirePermission, getCurrentUserRole } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import DepartmentHead from "@/models/DepartmentHead";
import type { MemberDepartment } from "@/models/Member";
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
  Sparkles,
  FileText,
  ArrowRight,
  UserCircle,
  UserCog,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Departments" };

// ── Department display metadata ────────────────────────────────────────────
const DEPT_META: Record<
  MemberDepartment,
  {
    icon:        React.ElementType;
    color:       string;
    bg:          string;
    border:      string;
    iconBg:      string;
    description: string;
  }
> = {
  Designing: {
    icon: Palette, color: "text-pink-600", bg: "bg-pink-50",
    border: "border-pink-200", iconBg: "bg-pink-100",
    description: "Visual design, branding, and creative assets.",
  },
  PR: {
    icon: Megaphone, color: "text-orange-600", bg: "bg-orange-50",
    border: "border-orange-200", iconBg: "bg-orange-100",
    description: "Public relations, sponsorships, and external communications.",
  },
  "Social Media": {
    icon: Share2, color: "text-sky-600", bg: "bg-sky-50",
    border: "border-sky-200", iconBg: "bg-sky-100",
    description: "Managing the club's online presence and content calendar.",
  },
  Volunteering: {
    icon: HandHeart, color: "text-emerald-600", bg: "bg-emerald-50",
    border: "border-emerald-200", iconBg: "bg-emerald-100",
    description: "Event volunteers, logistics, and on-ground coordination.",
  },
  Coverage: {
    icon: Camera, color: "text-violet-600", bg: "bg-violet-50",
    border: "border-violet-200", iconBg: "bg-violet-100",
    description: "Photography, videography, and event documentation.",
  },
  Technical: {
    icon: Code2, color: "text-indigo-600", bg: "bg-indigo-50",
    border: "border-indigo-200", iconBg: "bg-indigo-100",
    description: "Tech platforms, website, and digital infrastructure.",
  },
  Decoration: {
    icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50",
    border: "border-amber-200", iconBg: "bg-amber-100",
    description: "Venue decoration, aesthetic themes, and set designs.",
  },
  Content: {
    icon: FileText, color: "text-teal-600", bg: "bg-teal-50",
    border: "border-teal-200", iconBg: "bg-teal-100",
    description: "Writing newsletters, scripts, and written communication.",
  },
};

// ── Types ──────────────────────────────────────────────────────────────────
interface DeptSummary {
  dept:        MemberDepartment;
  activeCount: number;
  totalCount:  number;
  head:        {
    assignmentId: string;
    name:         string;
    profilePicture: string | null;
  } | null;
}

// ── Data fetching ──────────────────────────────────────────────────────────
async function getDepartmentSummaries(): Promise<DeptSummary[]> {
  await connectDB();

  const [members, headAssignments] = await Promise.all([
    Member.find({})
      .select("name profilePicture avatarUrl department isActive")
      .lean(),
    DepartmentHead.find({})
      .populate<{
        member: {
          _id:            unknown;
          name:           string;
          profilePicture?: string;
          avatarUrl?:      string;
        };
      }>("member", "name profilePicture avatarUrl")
      .lean(),
  ]);

  // Build a lookup: department → head assignment
  const headByDept = new Map<
    string,
    { assignmentId: string; name: string; profilePicture: string | null }
  >();
  for (const assignment of headAssignments) {
    if (assignment.member) {
      headByDept.set(assignment.department, {
        assignmentId:   String(assignment._id),
        name:           assignment.member.name,
        profilePicture: assignment.member.profilePicture
          ?? assignment.member.avatarUrl
          ?? null,
      });
    }
  }

  const departments = Object.keys(DEPT_META) as MemberDepartment[];

  return departments.map((dept) => {
    const all    = members.filter((m) => m.department === dept);
    const active = all.filter((m) => m.isActive);

    return {
      dept,
      activeCount: active.length,
      totalCount:  all.length,
      head:        headByDept.get(dept) ?? null,
    };
  });
}

// ── Page ───────────────────────────────────────────────────────────────────
export default async function DepartmentsPage() {
  await requirePermission("view_directory");
  const role = await getCurrentUserRole();
  const isPresident = role === "president";

  let summaries: DeptSummary[] = [];
  try {
    summaries = await getDepartmentSummaries();
  } catch {
    summaries = (Object.keys(DEPT_META) as MemberDepartment[]).map((dept) => ({
      dept, activeCount: 0, totalCount: 0, head: null,
    }));
  }

  const totalActive = summaries.reduce((s, d) => s + d.activeCount, 0);

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-indigo-500" />
            <h1 className="font-display text-2xl font-bold text-slate-900">Departments</h1>
          </div>
          <p className="text-slate-500 text-sm">
            {totalActive} active member{totalActive !== 1 ? "s" : ""} across{" "}
            {summaries.length} departments · click a card to view its members
          </p>
        </div>

        {/* President shortcut to manage heads */}
        {isPresident && (
          <Link
            href="/dashboard/members/manage"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <UserCog className="w-4 h-4 text-indigo-500" />
            Assign Heads
          </Link>
        )}
      </div>

      {/* Cards grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {summaries.map(({ dept, activeCount, totalCount, head }) => {
          const meta = DEPT_META[dept];
          const Icon = meta.icon;

          return (
            <Link
              key={dept}
              href={`/dashboard/members?department=${encodeURIComponent(dept)}`}
              className={`group relative flex flex-col rounded-2xl border ${meta.border} bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
            >
              {/* Coloured top strip */}
              <div className={`h-1.5 w-full ${meta.bg}`} />

              <div className="flex flex-col gap-4 p-5">

                {/* Icon + dept name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${meta.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${meta.color}`} />
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-900 leading-tight">{dept}</h2>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug line-clamp-1">
                        {meta.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>

                {/* Divider */}
                <div className={`border-t ${meta.border}`} />

                {/* Head + member count */}
                <div className="flex items-center justify-between">

                  {/* Department head */}
                  <div className="flex items-center gap-2.5">
                    {head?.profilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={head.profilePicture}
                        alt={head.name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-white border border-slate-200 flex-shrink-0"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full ${meta.iconBg} flex items-center justify-center flex-shrink-0`}>
                        {head ? (
                          <span className={`text-xs font-bold ${meta.color}`}>
                            {head.name.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <UserCircle className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                    )}
                    <div className="min-w-0">
                      {head ? (
                        <>
                          <p className="text-xs font-medium text-slate-700 truncate leading-tight">
                            {head.name}
                          </p>
                          <p className="text-[10px] text-slate-400 leading-tight">Head</p>
                        </>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No head assigned</p>
                      )}
                    </div>
                  </div>

                  {/* Active member count */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Users className={`w-3.5 h-3.5 ${meta.color}`} />
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-800">{activeCount}</span>
                      {totalCount !== activeCount && (
                        <span className="text-xs text-slate-400 ml-1">/ {totalCount}</span>
                      )}
                      <p className="text-[10px] text-slate-400 leading-tight">active</p>
                    </div>
                  </div>

                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
