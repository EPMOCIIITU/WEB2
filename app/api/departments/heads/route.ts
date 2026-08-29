/**
 * app/api/departments/heads/route.ts
 *
 * GET  /api/departments/heads
 *   Returns all department-head assignments, each populated with the
 *   member's name, profilePicture, and department.
 *   Requires: approved + active member.
 *
 * POST /api/departments/heads
 *   Assigns a member as head of a department.
 *   Body: { memberId: string, department: string }
 *   Requires: president only (manage_members permission).
 *
 * RULES
 * ─────
 * • A department may have at most ONE active head at a time.
 *   If one already exists the request is rejected with 409.
 *   (Use DELETE first to remove the existing assignment, then POST again.)
 * • The member must belong to the department being assigned.
 * • The member must be approved and active.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import DepartmentHead from "@/models/DepartmentHead";
import Member from "@/models/Member";
import { getCurrentUserRole, hasPermission } from "@/lib/rbac";
import { getApprovedMember } from "@/lib/auth/requireApprovedMember";

// ── GET /api/departments/heads ────────────────────────────────────────────
export async function GET(_req: NextRequest) {
  try {
    const authResult = await getApprovedMember();
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const heads = await DepartmentHead.find({})
      .populate("member", "name profilePicture avatarUrl department designation isActive")
      .sort({ department: 1 })
      .lean();

    return NextResponse.json({ success: true, data: heads });
  } catch (err) {
    console.error("[GET /api/departments/heads]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── POST /api/departments/heads ───────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Step 1: Clerk auth
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: RBAC — president only
    const role = await getCurrentUserRole();
    if (!hasPermission(role, "manage_members")) {
      return NextResponse.json(
        { error: "Forbidden: only the president can assign department heads" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { memberId, department } = body as { memberId?: string; department?: string };

    if (!memberId || !department) {
      return NextResponse.json(
        { error: "memberId and department are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Step 3: Validate the member exists, is approved, and is active
    const member = await Member.findById(memberId).lean();
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }
    if (!member.isApproved) {
      return NextResponse.json(
        { error: "Member must be approved before being assigned as a department head" },
        { status: 400 }
      );
    }
    if (!member.isActive) {
      return NextResponse.json(
        { error: "Member must be active before being assigned as a department head" },
        { status: 400 }
      );
    }

    // Step 4: Validate the member belongs to that department
    if (member.department !== department) {
      return NextResponse.json(
        {
          error: `Member belongs to the "${member.department}" department, not "${department}". ` +
                 `A department head must be a member of that department.`,
        },
        { status: 400 }
      );
    }

    // Step 5: Enforce one-head-per-department rule
    const existing = await DepartmentHead.findOne({ department });
    if (existing) {
      return NextResponse.json(
        {
          error: `Department "${department}" already has a head assigned. ` +
                 `Remove the existing head first via DELETE /api/departments/heads/${existing._id}`,
          existingAssignmentId: String(existing._id),
        },
        { status: 409 }
      );
    }

    // Step 6: Create the assignment and promote member's designation to "Head"
    // Both operations must succeed together for consistency.
    const assignment = await DepartmentHead.create({
      department,
      member:     memberId,
      assignedBy: userId,
    });

    // Promote the member's designation to "Head" so RBAC and UI reflect the role.
    // We use findByIdAndUpdate so this is a targeted write, not a full document save.
    await Member.findByIdAndUpdate(memberId, {
      $set: { designation: "Head", role: "Head" },
    });

    const populated = await DepartmentHead.findById(assignment._id)
      .populate("member", "name profilePicture avatarUrl department designation")
      .lean();

    return NextResponse.json({ success: true, data: populated }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/departments/heads]", err);
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "This member is already the head of that department" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
