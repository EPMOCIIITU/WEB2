/**
 * app/api/tasks/[taskId]/route.ts — Single Task Endpoints
 *
 * PATCH  /api/tasks/[taskId] → update task status / submit work / review
 * DELETE /api/tasks/[taskId] → delete task
 *
 * SECURITY: Both endpoints now require an approved + active EPMOC member.
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { getApprovedMember } from "@/lib/auth/requireApprovedMember";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    // Require approved + active member
    const authResult = await getApprovedMember();
    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const { member: currentMember } = authResult;

    const { taskId } = await params;

    await connectDB();

    // Older seeded tasks may have string identifiers instead of ObjectIds.
    const task =
      (await Task.findById(taskId).catch(() => null)) ??
      (await Task.collection.findOne({ _id: taskId } as never));

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      description,
      assignedTo,
      status,
      priority,
      dueDate,
      workLink,
      submissionNote,
      reviewNote,
    } = body;

    const currentMemberId   = currentMember._id.toString();
    const isAuthor          = task.assignedBy?.toString() === currentMemberId;
    const isAssignee        = task.assignedTo?.toString() === currentMemberId;
    const isPresidentOrCore = ["president", "core"].includes(currentMember.designation);

    // ── Reviewing a submission ───────────────────────────────────────────
    const reviewStatuses = ["needs_revision", "declined", "approved"];
    const isReviewing    = status !== undefined && reviewStatuses.includes(status);

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
      if (
        status === "needs_revision" &&
        (typeof reviewNote !== "string" || !reviewNote.trim())
      ) {
        return NextResponse.json(
          { error: "A message is required when requesting revisions" },
          { status: 400 }
        );
      }
      task.status     = status;
      task.reviewNote =
        typeof reviewNote === "string" ? reviewNote.trim() : undefined;
    }

    // ── Submitting work ──────────────────────────────────────────────────
    const isSubmitting = workLink !== undefined || submissionNote !== undefined;

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
      task.workLink       = workLink.trim();
      task.submissionNote =
        typeof submissionNote === "string" ? submissionNote.trim() : undefined;
      task.submittedAt    = new Date();
      task.status         = "pending_review";
    }

    // ── Modifying task details ───────────────────────────────────────────
    const isModifyingDetails =
      title !== undefined ||
      description !== undefined ||
      priority !== undefined ||
      dueDate !== undefined ||
      (assignedTo !== undefined &&
        assignedTo !== currentMemberId &&
        assignedTo !== null);

    if (isModifyingDetails && !isAuthor && !isPresidentOrCore) {
      return NextResponse.json(
        { error: "Forbidden: Only the task creator or club admins can edit details" },
        { status: 403 }
      );
    }

    // ── Changing status (not submit/review) ──────────────────────────────
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

    // ── Assigning / claiming / unassigning ───────────────────────────────
    if (assignedTo !== undefined) {
      if (
        assignedTo === currentMemberId ||
        assignedTo === null ||
        isAuthor ||
        isPresidentOrCore
      ) {
        task.assignedTo = assignedTo ? assignedTo : null;
      } else {
        return NextResponse.json(
          { error: "Forbidden: Cannot assign task to other members" },
          { status: 403 }
        );
      }
    }

    if (title !== undefined)       task.title       = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined)    task.priority    = priority;
    if (dueDate !== undefined)     task.dueDate     = dueDate ? new Date(dueDate) : undefined;

    if (typeof task.save === "function") {
      await task.save();
    } else {
      await Task.collection.updateOne(
        { _id: taskId } as never,
        {
          $set: {
            assignedTo:     task.assignedTo,
            status:         task.status,
            workLink:       task.workLink,
            submissionNote: task.submissionNote,
            reviewNote:     task.reviewNote,
            submittedAt:    task.submittedAt,
            updatedAt:      new Date(),
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    // Require approved + active member
    const authResult = await getApprovedMember();
    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }
    const { member: currentMember } = authResult;

    const { taskId } = await params;

    await connectDB();

    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const isAuthor          = task.assignedBy.toString() === currentMember._id.toString();
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
