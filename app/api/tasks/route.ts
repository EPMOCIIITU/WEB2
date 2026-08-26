/**
 * app/api/tasks/route.ts — Tasks API
 *
 * GET  /api/tasks  → list tasks visible to the current member
 * POST /api/tasks  → create a new task
 *
 * SECURITY: Both endpoints now require an approved + active EPMOC member.
 * A Clerk-authenticated but unapproved account receives 403, not task data.
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { getApprovedMember } from "@/lib/auth/requireApprovedMember";

export async function GET(_req: NextRequest) {
  try {
    // Require approved + active member — not just Clerk authentication
    const authResult = await getApprovedMember();
    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const { member: currentMember } = authResult;

    await connectDB();

    // Fetch tasks relevant to this member:
    //   1. Unassigned tasks (assignedTo is null)
    //   2. Tasks assigned to this member
    //   3. Tasks created by this member
    const tasks = await Task.find({
      $or: [
        { assignedTo: null },
        { assignedTo: currentMember._id },
        { assignedBy: currentMember._id },
      ],
    })
      .populate("assignedTo", "name profilePicture designation instituteEmail")
      .populate("assignedBy", "name profilePicture designation instituteEmail")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      currentMemberId: currentMember._id,
      canAssignTasks: ["president", "core"].includes(currentMember.designation),
      data: tasks,
    });
  } catch (err) {
    console.error("[GET /api/tasks]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Require approved + active member — not just Clerk authentication
    const authResult = await getApprovedMember();
    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const { member: currentMember } = authResult;

    await connectDB();

    const body = await req.json();
    const { title, description, assignedTo, priority, dueDate } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const newTask = new Task({
      title,
      description,
      assignedBy:  currentMember._id,
      assignedTo:  assignedTo ? assignedTo : null,
      status:      "todo",
      priority:    priority || "medium",
      dueDate:     dueDate ? new Date(dueDate) : null,
    });

    await newTask.save();

    const populatedTask = await Task.findById(newTask._id)
      .populate("assignedTo", "name profilePicture designation instituteEmail")
      .populate("assignedBy", "name profilePicture designation instituteEmail")
      .lean();

    return NextResponse.json({ success: true, data: populatedTask });
  } catch (err) {
    console.error("[POST /api/tasks]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
