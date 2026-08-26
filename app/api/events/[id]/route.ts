/**
 * app/api/events/[id]/route.ts
 *
 * PATCH  /api/events/[id] — update event (president/core)
 * DELETE /api/events/[id] — delete event (president/core)
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { getCurrentUserRole, hasPermission } from "@/lib/rbac";
import { getApprovedMember } from "@/lib/auth/requireApprovedMember";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: RouteContext) {
  try {
    const authResult = await getApprovedMember();
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const role = await getCurrentUserRole();
    if (!hasPermission(role, "edit_member")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await ctx.params;
    const body = await req.json();

    const allowed = ["title", "description", "date", "venue", "category", "isPublished", "posterUrl", "registrationLink"];
    const update: Record<string, unknown> = {};
    for (const field of allowed) {
      if (body[field] !== undefined) {
        update[field] = field === "date" ? new Date(body[field]) : body[field];
      }
    }

    await connectDB();
    const event = await Event.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: event });
  } catch (err) {
    console.error("[PATCH /api/events/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  try {
    const authResult = await getApprovedMember();
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const role = await getCurrentUserRole();
    if (!hasPermission(role, "edit_member")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await ctx.params;
    await connectDB();

    const event = await Event.findByIdAndDelete(id);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (err) {
    console.error("[DELETE /api/events/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
