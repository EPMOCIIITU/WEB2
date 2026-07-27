/**
 * app/(dashboard)/dashboard/analytics/page.tsx — Analytics Page
 *
 * Restricted to "president" and "core" roles.
 * Shows aggregated member statistics with Recharts visualisations.
 */

import { requirePermission } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import {
  BarChart3,
  TrendingUp,
  Users,
  PieChart,
  GitBranch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import {
  DeptPieChart,
  BranchBarChart,
  GrowthLineChart,
  YearBarChart,
} from "@/components/dashboard/AnalyticsCharts";

export const metadata: Metadata = { title: "Analytics" };

interface AggResult { _id: string; count: number }
interface YearResult { _id: number; count: number }

async function getAnalytics() {
  await connectDB();

  const [byDept, byBranch, byYear, byDesignation, totalMembers, activeMembers, growthRaw] =
    await Promise.all([
      Member.aggregate<AggResult>([
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Member.aggregate<AggResult>([
        { $group: { _id: "$branch", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Member.aggregate<YearResult>([
        { $group: { _id: "$year", count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Member.aggregate<AggResult>([
        { $group: { _id: "$designation", count: { $sum: 1 } } },
      ]),
      Member.countDocuments({}),
      Member.countDocuments({ isActive: true }),
      // Monthly join growth
      Member.aggregate<{ _id: { year: number; month: number }; count: number }>([
        {
          $group: {
            _id: { year: { $year: "$joinDate" }, month: { $month: "$joinDate" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 },
      ]),
    ]);

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const growth = growthRaw.map((d) => ({
    month: `${MONTHS[d._id.month - 1]} ${d._id.year}`,
    members: d.count,
  }));

  return { byDept, byBranch, byYear, byDesignation, totalMembers, activeMembers, growth };
}

export default async function AnalyticsPage() {
  await requirePermission("view_analytics");

  type AnalyticsData = Awaited<ReturnType<typeof getAnalytics>>;
  let data: AnalyticsData = {
    byDept: [], byBranch: [], byYear: [], byDesignation: [],
    totalMembers: 0, activeMembers: 0, growth: [],
  };

  try {
    data = await getAnalytics();
  } catch {
    // DB offline
  }

  const inactiveMembers = data.totalMembers - data.activeMembers;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Summary Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
        {[
          { label: "Total Members",  value: data.totalMembers,  icon: Users,      color: "text-indigo-500", bg: "bg-indigo-50"  },
          { label: "Active Members", value: data.activeMembers,  icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Departments",    value: data.byDept.length, icon: BarChart3,  color: "text-violet-500",  bg: "bg-violet-50"  },
          { label: "Inactive",       value: inactiveMembers,    icon: PieChart,   color: "text-amber-500",   bg: "bg-amber-50"   },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bg)}>
              <Icon className={cn("w-5 h-5", color)} />
            </div>
            <span className="text-3xl font-bold font-display text-slate-900">{value}</span>
            <span className="text-sm text-slate-500">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Charts Row 1: Dept Pie + Branch Bar ───────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-500" />
            Members by Department
          </h3>
          <DeptPieChart data={data.byDept} />
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-violet-500" />
            Members by Branch
          </h3>
          <BranchBarChart data={data.byBranch} />
        </div>
      </div>

      {/* ── Charts Row 2: Year Bar + Growth Line ──────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            Members by Year
          </h3>
          <YearBarChart data={data.byYear} />
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Monthly Join Growth
          </h3>
          <GrowthLineChart data={data.growth} />
        </div>
      </div>

      {/* ── Designation Breakdown ─────────────────────────────── */}
      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          Designation Breakdown
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.byDesignation.map(({ _id, count }) => (
            <div key={_id} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
              <span className="text-sm text-slate-700 capitalize font-medium">{_id}</span>
              <span className="text-lg font-bold text-slate-900">{count}</span>
            </div>
          ))}
          {data.byDesignation.length === 0 && (
            <p className="text-slate-400 text-sm col-span-3">No data yet — run npm run seed</p>
          )}
        </div>
      </div>
    </div>
  );
}
