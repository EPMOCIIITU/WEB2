/**
 * app/api/departments/heads/[id]/route.ts
 *
 * DELETE /api/departments/heads/[id]
 *   Removes a department-head assignment by its DepartmentHead document _id.
 *   Requires: president only (manage_members permission).
 *
 * The [id] is the DepartmentHead document _id, NOT the member's _id.
 * This keeps the API unambiguous when a member heads multiple departments.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import DepartmentHead from "@/models/DepartmentHead";
import { getCurrentUserRole, hasPermission } from "@/lib/rbac";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
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
        { error: "Forbidden: only the president can remove department head assignments" },
        { status: 403 }
      );
    }

    const { id } = await ctx.params;

    await connectDB();

    const deleted = await DepartmentHead.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Department head assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Head assignment for department "${deleted.department}" removed.`,
    });
  } catch (err) {
    console.error("[DELETE /api/departments/heads/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
