import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import Task from "@/models/Task";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the logged-in member record
    const currentMember = await Member.findOne({ clerkUserId: userId });
    if (!currentMember) {
      return NextResponse.json(
        { error: "Member profile not found" },
        { status: 404 }
      );
    }

    // Fetch tasks relevant to this user
    // 1. Unassigned: assignedTo is null
    // 2. Assigned to me: assignedTo = currentMember._id
    // 3. Assigned by me: assignedBy = currentMember._id
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Only active members (and specifically president/core for assigning, but let's allow all active members to create/assign tasks)
    const currentMember = await Member.findOne({ clerkUserId: userId });
    if (!currentMember) {
      return NextResponse.json(
        { error: "Member profile not found" },
        { status: 404 }
      );
    }

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
      assignedBy: currentMember._id,
      assignedTo: assignedTo ? assignedTo : null,
      status: "todo",
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    await newTask.save();

    const populatedTask = await Task.findById(newTask._id)
      .populate("assignedTo", "name profilePicture designation instituteEmail")
      .populate("assignedBy", "name profilePicture designation instituteEmail")
      .lean();

    return NextResponse.json({ success: true, data: populatedTask });
  } catch (err) {
    console.error("[POST /api/tasks]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
