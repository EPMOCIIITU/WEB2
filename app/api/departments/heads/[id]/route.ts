import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import DepartmentHead from "@/models/DepartmentHead";
import Member from "@/models/Member";
import { getCurrentUserRole, hasPermission } from "@/lib/rbac";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Revert the member's designation back to "member" — but only if they
    // are no longer the head of any other department.
    const remainingAssignments = await DepartmentHead.countDocuments({
      member: deleted.member,
    });

    if (remainingAssignments === 0) {
      await Member.findByIdAndUpdate(deleted.member, {
        $set: { designation: "member", role: "member" },
      });
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
