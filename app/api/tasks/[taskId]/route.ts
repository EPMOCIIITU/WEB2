import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import Task from "@/models/Task";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;

    await connectDB();

    const currentMember = await Member.findOne({ clerkUserId: userId });
    if (!currentMember) {
      return NextResponse.json(
        { error: "Member profile not found" },
        { status: 404 }
      );
    }

    // Older seeded tasks may have string identifiers instead of ObjectIds.
    const task =
      (await Task.findById(taskId).catch(() => null)) ??
      (await Task.collection.findOne({ _id: taskId } as never));
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, description, assignedTo, status, priority, dueDate, workLink, submissionNote, reviewNote } = body;

    const currentMemberId = currentMember._id.toString();
    const isAuthor = task.assignedBy?.toString() === currentMemberId;
    const isAssignee = task.assignedTo?.toString() === currentMemberId;
    const isPresidentOrCore = ["president", "core"].includes(currentMember.designation);

    // Permission checks
    // 1. Changing basic details (title, description, priority, dueDate, or reassigning to others)
    //    Requires being the author or president/core.
    const isModifyingDetails =
      title !== undefined ||
      description !== undefined ||
      priority !== undefined ||
      dueDate !== undefined ||
      (assignedTo !== undefined && assignedTo !== currentMemberId && assignedTo !== null);

    const isSubmitting = workLink !== undefined || submissionNote !== undefined;
    const reviewStatuses = ["needs_revision", "declined", "approved"];
    const isReviewing = status !== undefined && reviewStatuses.includes(status);

    if (isReviewing) {
      if (!isAuthor) {
        return NextResponse.json(
          { error: "Forbidden: Only the task creator can review submissions" },
          { status: 403 }
        );
      }

      if (task.status !== "pending_review") {
        return NextResponse.json(
          { error: "This task does not have a submission awaiting review" },
          { status: 400 }
        );
      }

      if (status === "needs_revision" && (typeof reviewNote !== "string" || !reviewNote.trim())) {
        return NextResponse.json(
          { error: "A message is required when requesting revisions" },
          { status: 400 }
        );
      }

      task.status = status;
      task.reviewNote = typeof reviewNote === "string" ? reviewNote.trim() : undefined;
    }

    if (isSubmitting) {
      if (!isAssignee) {
        return NextResponse.json(
          { error: "Forbidden: Only the assigned member can submit this task" },
          { status: 403 }
        );
      }

      if (typeof workLink !== "string" || !/^https?:\/\/\S+$/i.test(workLink.trim())) {
        return NextResponse.json(
          { error: "A valid work link is required" },
          { status: 400 }
        );
      }

      task.workLink = workLink.trim();
      task.submissionNote = typeof submissionNote === "string" ? submissionNote.trim() : undefined;
      task.submittedAt = new Date();
      task.status = "pending_review";
    }

    if (isModifyingDetails && !isAuthor && !isPresidentOrCore) {
      return NextResponse.json(
        { error: "Forbidden: Only the task creator or club admins can edit details" },
        { status: 403 }
      );
    }

    // 2. Changing status
    //    Requires being the creator, assignee, or president/core.
    if (status !== undefined && !isSubmitting && !isReviewing) {
      if (!isAuthor && !isAssignee && !isPresidentOrCore) {
        return NextResponse.json(
          { error: "Forbidden: You are not assigned to this task" },
          { status: 403 }
        );
      }
      if (!["todo", "in_progress", "completed"].includes(status)) {
        return NextResponse.json({ error: "Invalid task status" }, { status: 400 });
      }
      task.status = status;
    }

    // 3. Claiming task or unassigning
    //    If assignedTo is explicitly set to the current user (claiming) or set to null (unassigning)
    if (assignedTo !== undefined) {
      // Allow anyone to claim an unassigned task, or allow author/admin to assign
      if (assignedTo === currentMemberId || assignedTo === null || isAuthor || isPresidentOrCore) {
        task.assignedTo = assignedTo ? assignedTo : null;
      } else {
        return NextResponse.json(
          { error: "Forbidden: Cannot assign task to other members" },
          { status: 403 }
        );
      }
    }

    // Update other details if allowed
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : undefined;

    if (typeof task.save === "function") {
      await task.save();
    } else {
      await Task.collection.updateOne(
        { _id: taskId } as never,
        {
          $set: {
            assignedTo: task.assignedTo,
            status: task.status,
            workLink: task.workLink,
            submissionNote: task.submissionNote,
            reviewNote: task.reviewNote,
            submittedAt: task.submittedAt,
            updatedAt: new Date(),
          },
        }
      );
    }

    const populatedTask =
      typeof task.save === "function"
        ? await Task.findById(task._id)
            .populate("assignedTo", "name profilePicture designation instituteEmail")
            .populate("assignedBy", "name profilePicture designation instituteEmail")
            .lean()
        : await Task.collection.findOne({ _id: taskId } as never);

    return NextResponse.json({ success: true, data: populatedTask });
  } catch (err) {
    console.error("[PATCH /api/tasks/[taskId]]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { taskId } = await params;

    await connectDB();

    const currentMember = await Member.findOne({ clerkUserId: userId });
    if (!currentMember) {
      return NextResponse.json(
        { error: "Member profile not found" },
        { status: 404 }
      );
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const isAuthor = task.assignedBy.toString() === currentMember._id.toString();
    const isPresidentOrCore = ["president", "core"].includes(currentMember.designation);

    if (!isAuthor && !isPresidentOrCore) {
      return NextResponse.json(
        { error: "Forbidden: Only the task creator or club admins can delete tasks" },
        { status: 403 }
      );
    }

    await Task.findByIdAndDelete(taskId);

    return NextResponse.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    console.error("[DELETE /api/tasks/[taskId]]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
