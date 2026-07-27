/**
 * app/(dashboard)/layout.tsx — Dashboard Route Group Layout
 *
 * Protected layout shared by all /dashboard/* pages.
 * Renders DashboardSidebar + DashboardHeader alongside page content.
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getCurrentUserRole } from "@/lib/rbac";
import { ROLE_LABELS } from "@/lib/roles";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const role = await getCurrentUserRole();
  const fullName = user?.fullName?.trim() || user?.firstName || "Member";
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
