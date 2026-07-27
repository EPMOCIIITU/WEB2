/**
 * app/(dashboard)/dashboard/events/new/page.tsx — Add Event
 */

import { requirePermission } from "@/lib/rbac";
import { CalendarPlus } from "lucide-react";
import type { Metadata } from "next";
import AddEventForm from "@/components/dashboard/AddEventForm";

export const metadata: Metadata = { title: "Add Event" };

export default async function AddEventPage() {
  await requirePermission("edit_member");

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
          <CalendarPlus className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">
            Add New Event
          </h1>
          <p className="text-slate-500 text-sm">
            Create a club event that will appear on the public events page.
          </p>
        </div>
      </div>

      <div className="card p-6">
        <AddEventForm />
      </div>
    </div>
  );
}