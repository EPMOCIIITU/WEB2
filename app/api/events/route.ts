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
import fs from "fs/promises";
import path from "path";

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

    let title: string | null = null;
    let description: string | null = null;
    let date: string | null = null;
    let venue: string | null = null;
    let category: string | null = null;
    let isPublished: boolean = true;
    let posterUrl: string | null = null;
    let registrationLink: string | null = null;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      title = String(form.get("title") || "");
      description = String(form.get("description") || "");
      date = String(form.get("date") || "");
      venue = String(form.get("venue") || "");
      category = String(form.get("category") || "");
      isPublished = String(form.get("isPublished") || "true") === "true";
      registrationLink = String(form.get("registrationLink") || "");

      const file = form.get("poster") as any;
      if (!file || typeof file.arrayBuffer !== "function") {
        return NextResponse.json({ error: "Poster image is required" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "")}`;
      const filepath = path.join(uploadsDir, filename);
      await fs.writeFile(filepath, buffer);
      posterUrl = `/uploads/${filename}`;
    } else {
      const body = await req.json();
      title = body.title;
      description = body.description;
      date = body.date;
      venue = body.venue;
      category = body.category;
      isPublished = body.isPublished ?? true;
      posterUrl = body.posterUrl ?? null;
      registrationLink = body.registrationLink ?? null;
    }

    if (!title || !description || !date || !venue || !category) {
      return NextResponse.json(
        { error: "title, description, date, venue, category and poster are required" },
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
