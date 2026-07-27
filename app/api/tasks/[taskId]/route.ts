import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { getCurrentUserRole, hasPermission } from "@/lib/rbac";
import Task from "@/models/Task";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { taskId } = await params;
  const body = await request.json();
  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
  const role = await getCurrentUserRole();
  if (body.action === "submit") {
    if (task.assignedToId !== userId) return NextResponse.json({ error: "You can only submit your own tasks" }, { status: 403 });
    if (!body.submissionText?.trim() && !body.submissionLink?.trim()) return NextResponse.json({ error: "Add work details or a submission link" }, { status: 400 });
    task.submissionText = body.submissionText?.trim(); task.submissionLink = body.submissionLink?.trim(); task.submittedAt = new Date(); task.status = "submitted"; task.reviewerRemarks = undefined;
  } else if (body.action === "review") {
    if (!hasPermission(role, "assign_tasks") || task.assignedById !== userId) return NextResponse.json({ error: "Only the assigning Head can review this task" }, { status: 403 });
    if (!['completed', 'needs_improvement'].includes(body.status)) return NextResponse.json({ error: "Choose an outcome" }, { status: 400 });
    if (body.status === "needs_improvement" && !body.reviewerRemarks?.trim()) return NextResponse.json({ error: "Remarks are required when requesting improvements" }, { status: 400 });
    task.status = body.status; task.reviewerRemarks = body.reviewerRemarks?.trim(); task.reviewedAt = new Date();
  } else return NextResponse.json({ error: "Unsupported task action" }, { status: 400 });
  await task.save();
  return NextResponse.json({ data: task });
}
