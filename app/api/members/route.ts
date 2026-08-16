/**
 * app/api/members/route.ts — REST API Endpoints for Members
 *
 * GET  /api/members  → List members (all authenticated users)
 * POST /api/members  → Create a member (president/core only)
 *
 * HOW CLERK AUTH WORKS IN ROUTE HANDLERS:
 *   Use `auth()` from "@clerk/nextjs/server" to get the userId.
 *   The middleware has already verified the session cookie by the time
 *   this route handler runs, so no manual token verification is needed.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import { getCurrentUserRole, hasPermission } from "@/lib/rbac";
import { parseMember, MemberInput } from "@/lib/validators/member";
import { isValidImageUrl } from "@/lib/utils/image";

// ── GET /api/members ──────────────────────────────────────────────────────
export async function GET(_req: NextRequest) {
  try {
    // Authenticate the request
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // All authenticated users can list members
    const members = await Member.find({})
      .select("-__v") // Exclude Mongoose version key
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: members });
  } catch (err) {
    console.error("[GET /api/members]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── POST /api/members ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only president and core can create members
    const role = await getCurrentUserRole();
    if (!hasPermission(role, "edit_member")) {
      return NextResponse.json(
        { error: "Forbidden: insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input with Zod
    const parsed = parseMember(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.format() }, { status: 400 });
    }

    const data: MemberInput = parsed.data;

    const name = data.name;
    const instituteEmail = data.instituteEmail ?? data.email;
    const phoneNumber = data.phoneNumber;
    const department = data.department;
    const branch = data.branch;
    const year = Number(data.year);
    const designation = data.designation;
    const domain = data.domain;

    // Validate avatar/profile image URLs
    const avatar = data.avatarUrl ?? data.profilePicture ?? null;
    if (avatar && !isValidImageUrl(avatar)) {
      return NextResponse.json({ error: "Invalid avatar/profilePicture URL" }, { status: 400 });
    }

    await connectDB();

    const member = await Member.create({
      clerkUserId: data.clerkUserId ?? (body as any).clerkId ?? `manual_${Date.now()}`,
      clerkId: (body as any).clerkId ?? data.clerkUserId ?? `manual_${Date.now()}`,
      name,
      profilePicture: data.profilePicture ?? data.avatarUrl,
      phoneNumber,
      instituteEmail,
      email: instituteEmail,  
      department,
      branch,
      year,
      designation,
      role: designation,
      domain,
      joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
      isApproved: data.isApproved ?? false,
      isActive: data.isActive ?? true,
      status: (data.isActive ?? true) === false ? "inactive" : "active",
      avatarUrl: data.avatarUrl ?? data.profilePicture,
    });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/members]", err);
    // Handle MongoDB duplicate key errors (e.g., duplicate email)
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "A member with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
