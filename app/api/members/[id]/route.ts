/**
 * app/api/members/[id]/route.ts — Single Member REST Endpoints
 *
 * GET    /api/members/[id] → fetch one member
 * PATCH  /api/members/[id] → update member (president/core only)
 * DELETE /api/members/[id] → delete member (president only)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import { getCurrentUserRole, hasPermission } from "@/lib/rbac";

type RouteContext = { params: Promise<{ id: string }> };

// ── GET /api/members/[id] ─────────────────────────────────────────────────
export async function GET(_req: NextRequest, ctx: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;
    await connectDB();

    const member = await Member.findById(id).select("-__v").lean();
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

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
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = await getCurrentUserRole();
    if (!hasPermission(role, "edit_member")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await ctx.params;
    const body = await req.json();

    // Whitelist updatable fields
    const allowedFields = [
      "designation", "department", "branch", "year", "domain",
      "isApproved", "isActive", "bio", "phoneNumber", "name",
    ];
    // President-only fields
    if (role === "president") {
      allowedFields.push("instituteEmail");
    }

    const update: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) update[field] = body[field];
    }
    // Keep legacy fields in sync
    if (update.designation) update.role = update.designation;
    if (update.isActive !== undefined) update.status = update.isActive ? "active" : "inactive";
    if (update.instituteEmail) update.email = update.instituteEmail;

    await connectDB();
    const member = await Member.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();

    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

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
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = await getCurrentUserRole();
    if (!hasPermission(role, "delete_member")) {
      return NextResponse.json({ error: "Forbidden — president only" }, { status: 403 });
    }

    const { id } = await ctx.params;
    await connectDB();

    const member = await Member.findByIdAndDelete(id);
    if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Member deleted" });
  } catch (err) {
    console.error("[DELETE /api/members/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
