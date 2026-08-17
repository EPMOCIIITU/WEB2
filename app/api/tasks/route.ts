import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { getCurrentUserRole, getCurrentMember, hasPermission } from "@/lib/rbac";
import Member from "@/models/Member";
import Task from "@/models/Task";

// ── GET /api/tasks ────────────────────────────────────────────────────────────
// Heads see tasks they created/assigned; members see tasks assigned to them.
export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentMember = await getCurrentMember();
  if (!currentMember) return NextResponse.json({ error: "Member record not found" }, { status: 404 });

  const type = request.nextUrl.searchParams.get("type");
  const role = await getCurrentUserRole();

  let filter = {};
  if (type === "assigned") {
    filter = { assignedTo: currentMember._id };
  } else if (type === "created") {
    if (!hasPermission(role, "assign_tasks")) {
      return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
    }
    filter = { createdBy: currentMember._id };
  } else {
    filter = hasPermission(role, "assign_tasks")
      ? { createdBy: currentMember._id }
      : { assignedTo: currentMember._id };
  }

  const tasks = await Task.find(filter)
    .populate("createdBy", "name profilePicture designation")
    .populate("assignedTo", "name profilePicture designation")
    .populate("assignedBy", "name profilePicture designation")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ data: tasks });
}

// ── POST /api/tasks ───────────────────────────────────────────────────────────
// Creates a task. assignedTo is optional — can be assigned later.
export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = await getCurrentUserRole();
  if (!hasPermission(role, "assign_tasks"))
    return NextResponse.json({ error: "Only Heads can create tasks" }, { status: 403 });

  const body = await request.json();
  if (!body.title?.trim() || !body.description?.trim())
    return NextResponse.json({ error: "Title and description are required" }, { status: 400 });

  // Resolve the creator (the logged-in user)
  const creator = await getCurrentMember();
  if (!creator) return NextResponse.json({ error: "Your member record was not found" }, { status: 404 });

  // Optionally resolve the assignee if provided
  let assignedMember = null;
  if (body.assignedToMemberId) {
    assignedMember = await Member.findById(body.assignedToMemberId).lean();
    if (!assignedMember) return NextResponse.json({ error: "Selected assignee was not found" }, { status: 404 });
  }

  const task = await Task.create({
    title: body.title.trim(),
    description: body.description.trim(),
    dueDate: body.dueDate || undefined,
    createdBy: creator._id,
    assignedTo: assignedMember ? assignedMember._id : null,
    assignedBy: assignedMember ? creator._id : null,
    status: assignedMember ? "assigned" : "open",
  });

  const populated = await task.populate([
    { path: "createdBy", select: "name profilePicture designation" },
    { path: "assignedTo", select: "name profilePicture designation" },
    { path: "assignedBy", select: "name profilePicture designation" },
  ]);

  return NextResponse.json({ data: populated }, { status: 201 });
}
