/**
 * app/(dashboard)/layout.tsx — Dashboard Route Group Layout
 *
 * Protected layout shared by all /dashboard/* pages EXCEPT
 * /dashboard/access-denied (which has its own standalone layout to avoid
 * an infinite redirect loop).
 *
 * AUTHORIZATION CHAIN (all must pass):
 *   1. Clerk session valid          — enforced by middleware.ts
 *   2. MongoDB Member record exists — clerkUserId matches auth userId
 *   3. member.isApproved === true
 *   4. member.isActive   === true
 *
 * If checks 2–4 fail, requireApprovedMember() redirects to
 * /dashboard/access-denied, which lives outside this layout group.
 */

import { currentUser } from "@clerk/nextjs/server";
import { requireApprovedMember } from "@/lib/auth/requireApprovedMember";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getCurrentUserRole } from "@/lib/rbac";
import { ROLE_LABELS } from "@/lib/roles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Full membership check: Clerk auth + MongoDB approved + active.
  // Redirects to /dashboard/access-denied if any check fails.
  await requireApprovedMember();

  // Fetch display data after the guard passes.
  const user        = await currentUser();
  const role        = await getCurrentUserRole();
  const fullName    = user?.fullName?.trim() || user?.firstName || "Member";
  const designation = ROLE_LABELS[role];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar — fixed on desktop, drawer on mobile */}
      <DashboardSidebar
        role={role}
        fullName={fullName}
        designation={designation}
        imageUrl={user?.imageUrl || null}
      />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
