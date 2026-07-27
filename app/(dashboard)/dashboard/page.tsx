/**
 * app/(dashboard)/dashboard/page.tsx — Dashboard Overview
 *
 * Role-aware landing page shown after login.
 * Displays:
 *   - Quick stats (total members, active, by role)
 *   - Role-specific action cards
 *   - Recent member activity (placeholder)
 *
 * Server Component — fetches data server-side before render.
 */

import { MyTasks } from "@/components/dashboard/TaskWorkspace";

export default function DashboardOverviewPage() {
  return <div className="min-h-[calc(100vh-1px)] bg-white p-6 lg:p-8"><MyTasks /></div>;
}
