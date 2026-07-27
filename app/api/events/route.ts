/**
 * app/api/events/route.ts — Events API
 *
 * GET  /api/events — list events (public: published only; authenticated: all)
 * POST /api/events — create event (president/core only)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { getCurrentUserRole, hasPermission } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { userId } = await auth();

    // Unauthenticated users only see published events
    const filter = userId ? {} : { isPublished: true };
    const events = await Event.find(filter).sort({ date: -1 }).lean();

    return NextResponse.json({ success: true, data: events });
  } catch (err) {
    console.error("[GET /api/events]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = await getCurrentUserRole();
    if (!hasPermission(role, "edit_member")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, date, venue, category, isPublished, posterUrl, registrationLink } = body;

    if (!title || !description || !date || !venue || !category) {
      return NextResponse.json(
        { error: "title, description, date, venue, and category are required" },
        { status: 400 }
      );
    }

    await connectDB();
    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      venue,
      category,
      isPublished: isPublished ?? true,
      createdBy: userId,
      posterUrl,
      registrationLink,
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/events]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
