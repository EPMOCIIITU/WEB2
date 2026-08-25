import { TasksClient } from "@/components/dashboard/TasksClient";
import { requirePermission } from "@/lib/rbac";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks Board | EPMOC",
};

export default async function TasksPage() {
  // Ensure the user is logged in and has access
  await requirePermission("view_directory");

  return (
    <div className="min-h-[calc(100vh-100px)] bg-slate-50/50 p-6 lg:p-8 rounded-2xl">
      <TasksClient />
    </div>
  );
}
