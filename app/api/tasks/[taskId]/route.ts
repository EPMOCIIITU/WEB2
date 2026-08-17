import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { getCurrentUserRole, getCurrentMember, hasPermission } from "@/lib/rbac";
import Member from "@/models/Member";
import Task from "@/models/Task";

// ── PATCH /api/tasks/[taskId] ─────────────────────────────────────────────────
// Supports two actions:
//   { action: "submit", submissionText, submissionLink }  — member submits work
//   { action: "review", status, reviewerRemarks }         — head reviews submission
//   { action: "assign", assignedToMemberId }              — head assigns an open task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;
  const body = await request.json();

  await connectDB();

  const task = await Task.findById(taskId);
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  // Resolve the current user's Member document
  const currentMember = await getCurrentMember();
  if (!currentMember) return NextResponse.json({ error: "Member record not found" }, { status: 404 });

  const role = await getCurrentUserRole();
  const currentMemberId = String(currentMember._id);

  // ── Submit action ────────────────────────────────────────────────────────
  if (body.action === "submit") {
    if (String(task.assignedTo) !== currentMemberId)
      return NextResponse.json({ error: "You can only submit your own tasks" }, { status: 403 });
    if (!body.submissionText?.trim() && !body.submissionLink?.trim())
      return NextResponse.json({ error: "Add work details or a submission link" }, { status: 400 });

    task.submissionText = body.submissionText?.trim();
    task.submissionLink = body.submissionLink?.trim();
    task.submittedAt = new Date();
    task.status = "submitted";
    task.reviewerRemarks = undefined;

  // ── Review action ────────────────────────────────────────────────────────
  } else if (body.action === "review") {
    if (!hasPermission(role, "assign_tasks") || String(task.createdBy) !== currentMemberId)
      return NextResponse.json({ error: "Only the creating Head can review this task" }, { status: 403 });
    if (!["completed", "needs_improvement"].includes(body.status))
      return NextResponse.json({ error: "Choose an outcome: completed or needs_improvement" }, { status: 400 });
    if (body.status === "needs_improvement" && !body.reviewerRemarks?.trim())
      return NextResponse.json({ error: "Remarks are required when requesting improvements" }, { status: 400 });

    task.status = body.status;
    task.reviewerRemarks = body.reviewerRemarks?.trim();
    task.reviewedAt = new Date();

  // ── Assign action ────────────────────────────────────────────────────────
  } else if (body.action === "assign") {
    if (!hasPermission(role, "assign_tasks") || String(task.createdBy) !== currentMemberId)
      return NextResponse.json({ error: "Only the creating Head can assign this task" }, { status: 403 });
    if (!body.assignedToMemberId)
      return NextResponse.json({ error: "assignedToMemberId is required" }, { status: 400 });

    const assignee = await Member.findById(body.assignedToMemberId).lean();
    if (!assignee) return NextResponse.json({ error: "Assignee not found" }, { status: 404 });

    task.assignedTo = assignee._id as typeof task.assignedTo;
    task.assignedBy = currentMember._id as typeof task.assignedBy;
    task.status = "assigned";

  } else {
    return NextResponse.json({ error: "Unsupported task action" }, { status: 400 });
  }

  await task.save();

  const populated = await task.populate([
    { path: "createdBy", select: "name profilePicture designation" },
    { path: "assignedTo", select: "name profilePicture designation" },
    { path: "assignedBy", select: "name profilePicture designation" },
  ]);

  return NextResponse.json({ data: populated });
}
