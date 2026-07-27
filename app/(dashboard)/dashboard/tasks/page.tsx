import { AssignTasks } from "@/components/dashboard/TaskWorkspace";
import { connectDB } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import Member from "@/models/Member";

export default async function TasksPage() {
  await requirePermission("assign_tasks");
  await connectDB();
  const records = await Member.find({}).select("clerkUserId name designation isActive").sort({ name: 1 }).lean();
  const members = records.map((member) => ({ clerkUserId: member.clerkUserId, name: member.name, designation: member.designation, isActive: member.isActive }));
  return <div className="min-h-screen p-6 lg:p-8"><AssignTasks members={members} /></div>;
}
