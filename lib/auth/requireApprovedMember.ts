/**
 * lib/auth/requireApprovedMember.ts — Central approved-member authorization guard.
 *
 * USE THIS EVERYWHERE a server component, layout, or API route needs to verify
 * that the caller is a real, approved, active EPMOC member — not just any
 * authenticated Clerk user.
 *
 * AUTHORIZATION CHAIN (must all pass):
 *   1. Clerk session is valid          → userId is non-null
 *   2. MongoDB Member exists           → clerkUserId === userId
 *   3. member.isApproved === true      → admin has approved the member
 *   4. member.isActive   === true      → member has not been deactivated
 *
 * The distinction between Clerk authentication (identity) and MongoDB
 * membership (authorization) is intentional:
 *   - Clerk tells us WHO the user is.
 *   - MongoDB tells us WHETHER they are an active EPMOC member.
 *
 * WHY NOT IN MIDDLEWARE?
 *   Next.js Edge middleware cannot run Mongoose/Node.js code. We perform
 *   Clerk authentication in middleware.ts and MongoDB authorization here, in
 *   Node-compatible server boundaries (layouts, server components, API routes).
 *
 * USAGE — in a layout or page:
 *   const member = await requireApprovedMember();  // redirects if not authorized
 *
 * USAGE — in an API route (returns a result instead of redirecting):
 *   const result = await getApprovedMember();
 *   if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
 *   const { member } = result;
 */

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import type { IMember } from "@/models/Member";

// ── Types ─────────────────────────────────────────────────────────────────

export type ApprovedMemberResult =
  | { ok: true; member: IMember; userId: string }
  | { ok: false; error: string; status: 401 | 403 | 404 };

// ── Core logic (does NOT redirect — returns a typed result) ──────────────

/**
 * Checks Clerk authentication AND MongoDB membership/approval.
 * Returns a typed result — never redirects. Safe for both API routes
 * and server components that need to handle the error themselves.
 */
export async function getApprovedMember(): Promise<ApprovedMemberResult> {
  // Step 1: Clerk authentication
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, error: "Unauthenticated", status: 401 };
  }

  // Step 2: MongoDB membership check
  try {
    await connectDB();
    const member = await Member.findOne({ clerkUserId: userId });

    if (!member) {
      return {
        ok: false,
        error: "No EPMOC member record found for this account.",
        status: 403,
      };
    }

    // Step 3: Approval check
    if (!member.isApproved) {
      return {
        ok: false,
        error: "Your membership is pending approval by an administrator.",
        status: 403,
      };
    }

    // Step 4: Active check
    if (!member.isActive) {
      return {
        ok: false,
        error: "Your membership has been deactivated. Please contact an administrator.",
        status: 403,
      };
    }

    return { ok: true, member, userId };
  } catch (err) {
    console.error("[getApprovedMember] DB error:", err);
    return {
      ok: false,
      error: "Unable to verify membership. Please try again.",
      status: 403,
    };
  }
}

// ── Guard variant (redirects on failure — use in layouts/pages) ───────────

/**
 * Enforces the full authorization chain for server layouts and pages.
 * Redirects to /sign-in if unauthenticated, or to /dashboard/access-denied
 * if authenticated but not an approved active member.
 *
 * @returns The approved, active IMember document.
 */
export async function requireApprovedMember(): Promise<IMember> {
  const result = await getApprovedMember();

  if (!result.ok) {
    if (result.status === 401) {
      redirect("/sign-in");
    }
    // 403: authenticated but not approved/active — show informative page.
    // /access-denied lives at the app root (outside the dashboard route group)
    // to avoid an infinite redirect loop with the dashboard layout guard.
    redirect("/access-denied");
  }

  return result.member;
}
