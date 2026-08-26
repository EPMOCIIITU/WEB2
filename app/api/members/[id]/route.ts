/**
 * app/api/members/[id]/route.ts — Single Member REST Endpoints
 *
 * GET    /api/members/[id] → fetch one member (approved members only)
 * PATCH  /api/members/[id] → update member details (president/core only)
 * DELETE /api/members/[id] → delete member (president only)
 *
 * SECURITY:
 *   isApproved is NOT in the PATCH whitelist.
 *   Approval must go through the dedicated /api/members/[id]/approve endpoint,
 *   which triggers Clerk account creation atomically. Allowing isApproved to be
 *   set via a generic PATCH would bypass that logic and leave the DB in an
 *   inconsistent state (isApproved = true but clerkUserId = null).
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import { getCurrentUserRole, hasPermission } from "@/lib/rbac";
import { getApprovedMember } from "@/lib/auth/requireApprovedMember";

type RouteContext = { params: Promise<{ id: string }> };

// ── GET /api/members/[id] ─────────────────────────────────────────────────
export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    // Require approved + active member to read member details
    const authResult = await getApprovedMember();
    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = await ctx.params;
    await connectDB();

    const member = await Member.findById(id).select("-__v").lean();
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member });
  } catch (err) {
    console.error("[GET /api/members/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── PATCH /api/members/[id] ───────────────────────────────────────────────
export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getCurrentUserRole();
    if (!hasPermission(role, "edit_member")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await ctx.params;
    const body = await req.json();

    // ── Field whitelist ────────────────────────────────────────────────────
    // isApproved is intentionally NOT in this list.
    // Approval changes must go through POST /api/members/[id]/approve which
    // atomically creates the Clerk account and sets isApproved = true together.
    //
    // clerkUserId / clerkId are also NOT in this list — server-controlled only.
    const allowedFields: string[] = [
      "name",
      "rollNumber",
      "phoneNumber",
      "hostel",
      "designation",
      "department",
      "branch",
      "year",
      "domain",
      "isActive",
      "bio",
    ];

    // President may also update the institute email
    if (role === "president") {
      allowedFields.push("instituteEmail");
    }

    // Warn callers that tried to set isApproved or clerkUserId directly
    if (body.isApproved !== undefined) {
      return NextResponse.json(
        {
          error:
            "isApproved cannot be changed via this endpoint. " +
            "Use POST /api/members/[id]/approve to approve a member.",
        },
        { status: 400 }
      );
    }
    if (body.clerkUserId !== undefined || body.clerkId !== undefined) {
      return NextResponse.json(
        { error: "Clerk identity fields are server-controlled and cannot be set via this endpoint." },
        { status: 400 }
      );
    }

    const update: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        update[field] = body[field];
      }
    }

    // Keep legacy fields in sync
    if (update.designation) update.role = update.designation;
    if (update.isActive !== undefined) {
      update.status = update.isActive ? "active" : "inactive";
    }
    if (update.instituteEmail) {
      update.email = update.instituteEmail;
    }

    await connectDB();
    const member = await Member.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member });
  } catch (err) {
    console.error("[PATCH /api/members/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── DELETE /api/members/[id] ──────────────────────────────────────────────
export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = await getCurrentUserRole();
    if (!hasPermission(role, "delete_member")) {
      return NextResponse.json(
        { error: "Forbidden — president only" },
        { status: 403 }
      );
    }

    const { id } = await ctx.params;
    await connectDB();

    const member = await Member.findByIdAndDelete(id);
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Member deleted" });
  } catch (err) {
    console.error("[DELETE /api/members/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
