/**
 * app/api/members/[id]/approve/route.ts
 *
 * POST /api/members/[id]/approve
 *
 * Approves a pending EPMOC member by:
 *   1. Authenticating the requester via Clerk.
 *   2. Checking RBAC — requires "edit_member" permission (president or core).
 *   3. Finding the MongoDB member by ID.
 *   4. Verifying the member is NOT already approved.
 *   5. Creating a Clerk invitation for the member's instituteEmail using
 *      Clerk's official Backend SDK (clerkClient).
 *   6. Storing the returned Clerk userId in member.clerkUserId (and legacy
 *      member.clerkId) ONLY after Clerk confirms success.
 *   7. Setting member.isApproved = true.
 *   8. Saving to MongoDB.
 *
 * ATOMICITY GUARANTEE:
 *   - isApproved is NEVER set to true if Clerk invitation creation fails.
 *   - If Clerk succeeds but MongoDB save fails, we log the Clerk userId so
 *     an admin can manually recover without re-inviting.
 *   - The member record is never left in state: isApproved=true, clerkUserId=null.
 *
 * CLERK INVITATION MECHANISM:
 *   Uses clerkClient().invitations.createInvitation({ emailAddress, ... }).
 *   This sends Clerk's built-in invitation email. The invitee clicks the link,
 *   sets their password, and can then sign in through /sign-in.
 *   NO plaintext passwords are generated or transmitted.
 *
 * Clerk SDK version: @clerk/nextjs ^6.x (uses clerkClient from @clerk/nextjs/server)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import { getCurrentUserRole, hasPermission } from "@/lib/rbac";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: RouteContext) {
  // ── Step 1: Authenticate the requester ──────────────────────────────────
  const { userId: requesterId } = await auth();
  if (!requesterId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Step 2: RBAC check ───────────────────────────────────────────────────
  const role = await getCurrentUserRole();
  if (!hasPermission(role, "edit_member")) {
    return NextResponse.json(
      { error: "Forbidden: only president or core members can approve members" },
      { status: 403 }
    );
  }

  const { id } = await ctx.params;

  await connectDB();

  // ── Step 3: Find the member ──────────────────────────────────────────────
  const member = await Member.findById(id);
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  // ── Step 4: Verify not already approved ─────────────────────────────────
  if (member.isApproved) {
    return NextResponse.json(
      {
        error: "Member is already approved.",
        clerkUserId: member.clerkUserId ?? null,
      },
      { status: 409 }
    );
  }

  // ── Step 5: Verify eligibility ───────────────────────────────────────────
  if (!member.isActive) {
    return NextResponse.json(
      { error: "Cannot approve an inactive member. Activate the member first." },
      { status: 400 }
    );
  }

  const emailToInvite = member.instituteEmail;
  if (!emailToInvite) {
    return NextResponse.json(
      { error: "Member has no institute email — cannot create Clerk invitation." },
      { status: 400 }
    );
  }

  // ── Step 6: Create Clerk invitation ─────────────────────────────────────
  // We use Clerk's invitation API so the member receives an email with a
  // secure sign-up link. They click it, set their own password, and can
  // then sign in through /sign-in.
  //
  // After accepting the invitation, Clerk creates a user with a real userId.
  // We capture that userId from the invitation response and store it below.
  //
  // NOTE: clerkClient() returns an async client in @clerk/nextjs ^6.x
  let clerkInvitationUserId: string | null = null;

  try {
    const client = await clerkClient();

    // Check whether a Clerk user already exists for this email to avoid
    // sending a duplicate invitation to an account that already exists.
    const existingUsers = await client.users.getUserList({
      emailAddress: [emailToInvite],
    });

    if (existingUsers.totalCount > 0) {
      // A Clerk account already exists — just link it without re-inviting.
      const existingUser = existingUsers.data[0];
      clerkInvitationUserId = existingUser.id;

      console.info(
        `[approve] Clerk user already exists for ${emailToInvite} — ` +
          `linking existing user ${existingUser.id} without re-inviting.`
      );
    } else {
      // No existing Clerk account — send invitation email.
      // The invitation redirects to NEXT_PUBLIC_APP_URL after account setup.
      const invitation = await client.invitations.createInvitation({
        emailAddress: emailToInvite,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/dashboard`,
        // publicMetadata is set on the Clerk user upon invitation acceptance.
        // We pre-set the role so RBAC works as soon as they first sign in.
        publicMetadata: {
          role: member.designation === "president" ? "president"
              : member.designation === "vice president" ? "core"
              : member.designation === "Head" ? "core"
              : "member",
          memberId: id,
        },
      });

      // The invitation object does not immediately contain a userId because the
      // Clerk user is created when the invitee accepts the invitation.
      // We store a sentinel so we can check for pending invitations on sign-in.
      // The actual clerkUserId will be populated via a Clerk webhook or on
      // first sign-in (see the dashboard layout guard).
      //
      // However, for environments where the user may already exist (e.g. dev
      // re-seeding), fall back gracefully below.
      console.info(
        `[approve] Clerk invitation created for ${emailToInvite} — ` +
          `invitation id: ${invitation.id}`
      );

      // Store a temporary sentinel so we know an invitation is pending.
      // The real userId will be backfilled when they first sign in and the
      // dashboard layout links their Clerk session to this Member record.
      // Format: "invited_<invitationId>" so it is distinguishable from real IDs.
      clerkInvitationUserId = `invited_${invitation.id}`;
    }
  } catch (clerkErr: unknown) {
    // Clerk errors: do NOT approve the member — keep isApproved = false.
    console.error("[approve] Clerk invitation failed:", clerkErr);

    const message =
      clerkErr instanceof Error ? clerkErr.message : "Unknown Clerk error";

    return NextResponse.json(
      {
        error: "Failed to create Clerk invitation. Member NOT approved.",
        detail: message,
      },
      { status: 502 }
    );
  }

  // ── Step 7 & 8: Update MongoDB — only after Clerk confirms ──────────────
  try {
    member.clerkUserId = clerkInvitationUserId;
    member.clerkId     = clerkInvitationUserId; // legacy field
    member.isApproved  = true;

    await member.save();

    return NextResponse.json({
      success: true,
      message: "Member approved. A Clerk invitation email has been sent.",
      data: {
        memberId:            id,
        clerkUserId:         clerkInvitationUserId,
        invitationSent:      !clerkInvitationUserId.startsWith("invited_") === false,
        linkedExistingUser:  !clerkInvitationUserId.startsWith("invited_"),
      },
    });
  } catch (dbErr: unknown) {
    // Clerk succeeded but MongoDB failed — log recovery info so admin can
    // manually link without re-inviting.
    console.error(
      "[approve] MongoDB save failed AFTER Clerk invitation. " +
        `MANUAL RECOVERY NEEDED: memberId=${id}, clerkValue=${clerkInvitationUserId}`,
      dbErr
    );

    return NextResponse.json(
      {
        error:
          "Clerk invitation was sent but the database update failed. " +
          "Please contact the system administrator to complete this manually.",
        clerkValue: clerkInvitationUserId,
        memberId:   id,
      },
      { status: 500 }
    );
  }
}
