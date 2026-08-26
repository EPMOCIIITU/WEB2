/**
 * app/api/members/route.ts — REST API Endpoints for Members
 *
 * GET  /api/members  → List members (approved + active members only)
 * POST /api/members  → Create a pending member (president/core only)
 *
 * SECURITY:
 *   - GET now requires an approved, active EPMOC member — not just Clerk auth.
 *     An authenticated-but-unapproved Clerk account cannot list members.
 *   - POST creates the MongoDB record with:
 *       clerkUserId = null   (no Clerk account yet)
 *       isApproved  = false  (forced server-side — never trusted from client)
 *     The client CANNOT set either field.
 *   - Approval (creating the Clerk account + setting isApproved = true) is a
 *     separate privileged operation: POST /api/members/[id]/approve
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import { getCurrentUserRole, hasPermission } from "@/lib/rbac";
import { getApprovedMember } from "@/lib/auth/requireApprovedMember";
import { parseMember, type MemberInput } from "@/lib/validators/member";
import { isValidImageUrl } from "@/lib/utils/image";

// ── GET /api/members ──────────────────────────────────────────────────────
export async function GET(_req: NextRequest) {
  try {
    // Require an approved, active member — not just Clerk authentication.
    // An unapproved account (pending invitation) must NOT be able to list members.
    const authResult = await getApprovedMember();
    if (!authResult.ok) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectDB();

    const members = await Member.find({})
      .select("-__v")
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
    // Step 1: Clerk authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Step 2: RBAC — only president and core can create members
    const role = await getCurrentUserRole();
    if (!hasPermission(role, "edit_member")) {
      return NextResponse.json(
        { error: "Forbidden: insufficient permissions" },
        { status: 403 }
      );
    }

    // Step 3: Parse and validate the request body with Zod.
    // NOTE: clerkUserId and isApproved are not in the schema and will be
    // silently ignored even if the client sends them.
    const body = await req.json();
    const parsed = parseMember(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data: MemberInput = parsed.data;

    // Resolve email — accept instituteEmail or legacy email field
    const instituteEmail = data.instituteEmail ?? data.email;
    if (!instituteEmail) {
      return NextResponse.json(
        { error: "instituteEmail is required" },
        { status: 400 }
      );
    }

    // Validate avatar/profile image URL against allowlist
    const avatar = data.avatarUrl ?? data.profilePicture ?? null;
    if (avatar && !isValidImageUrl(avatar)) {
      return NextResponse.json(
        { error: "Invalid avatar/profilePicture URL" },
        { status: 400 }
      );
    }

    await connectDB();

    // Step 4: Create the member.
    //
    // SECURITY INVARIANTS (enforced here, never from client):
    //   clerkUserId = null   — no Clerk account; set by /approve endpoint only
    //   clerkId     = null   — legacy field kept in sync
    //   isApproved  = false  — must be explicitly approved by admin
    //
    // isActive defaults to true but admin may set false to pre-stage an
    // inactive record (e.g. for a student graduating soon).
    const member = await Member.create({
      // ── Identity ───────────────────────────────────────────────────────
      clerkUserId: null,   // NEVER from client input
      clerkId:     null,   // NEVER from client input (legacy field)

      // ── Core fields from validated client input ────────────────────────
      name:           data.name,
      profilePicture: data.profilePicture ?? data.avatarUrl,
      avatarUrl:      data.avatarUrl ?? data.profilePicture,
      phoneNumber:    data.phoneNumber,
      rollNumber:     data.rollNumber,
      hostel:         data.hostel,
      instituteEmail,
      email:          instituteEmail,    // legacy sync
      department:     data.department,
      branch:         data.branch,
      year:           Number(data.year),
      designation:    data.designation,
      role:           data.designation,  // legacy sync
      domain:         data.domain,
      bio:            data.bio,
      joinDate:       data.joinDate ? new Date(data.joinDate) : new Date(),

      // ── Approval / status (server-controlled) ──────────────────────────
      isApproved: false,                                      // NEVER from client
      isActive:   data.isActive ?? true,
      status:     (data.isActive ?? true) ? "active" : "inactive", // legacy sync
    });

    return NextResponse.json({ success: true, data: member }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/members]", err);
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: "A member with this email or phone number already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
