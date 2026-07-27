import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { getCurrentUserRole, hasPermission } from "@/lib/rbac";
import Member from "@/models/Member";
import Task from "@/models/Task";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const role = await getCurrentUserRole();
  const tasks = await Task.find(hasPermission(role, "assign_tasks") ? { assignedById: userId } : { assignedToId: userId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ data: tasks });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = await getCurrentUserRole();
  if (!hasPermission(role, "assign_tasks")) return NextResponse.json({ error: "Only Heads can assign tasks" }, { status: 403 });
  const body = await request.json();
  if (!body.title?.trim() || !body.description?.trim() || !body.assignedToId) return NextResponse.json({ error: "Title, description, and assignee are required" }, { status: 400 });
  await connectDB();
  const member = await Member.findOne({ clerkUserId: body.assignedToId }).lean();
  if (!member) return NextResponse.json({ error: "Selected member was not found" }, { status: 404 });
  const user = await currentUser();
  const task = await Task.create({ title: body.title, description: body.description, dueDate: body.dueDate || undefined, assignedToId: member.clerkUserId, assignedToName: member.name, assignedById: userId, assignedByName: user?.fullName || "Head" });
  return NextResponse.json({ data: task }, { status: 201 });
}
