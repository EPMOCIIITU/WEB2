/**
 * app/access-denied/page.tsx
 *
 * Shown when a Clerk-authenticated user does NOT pass the MongoDB
 * membership/approval check in the dashboard layout.
 *
 * This page lives OUTSIDE the (dashboard) route group so that the
 * dashboard layout's requireApprovedMember() guard does not apply here —
 * avoiding an infinite redirect loop.
 *
 * Possible reasons the user lands here:
 *   - No MongoDB Member record linked to this Clerk userId
 *   - Member exists but isApproved = false (awaiting admin approval)
 *   - Member exists but isActive   = false (deactivated)
 *
 * Clerk authentication is still enforced by middleware.ts.
 * An unauthenticated user will be redirected to /sign-in before reaching
 * this page.
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { ShieldX, Clock, UserX, Mail } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Access Denied — EPMOC",
  description: "Your account does not currently have access to the EPMOC member portal.",
};

export default async function AccessDeniedPage() {
  // Require Clerk authentication — if not signed in, send to /sign-in.
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user  = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress ?? "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">

        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-rose-50 border border-rose-200 mx-auto">
          <ShieldX className="w-10 h-10 text-rose-500" />
        </div>

        {/* Heading */}
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-2">
            Access Denied
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Your account is not currently authorised to access the EPMOC
            member portal.
          </p>
        </div>

        {/* Possible reasons */}
        <div className="text-left bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Possible reasons
          </p>

          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">Pending approval</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Your membership has been registered but not yet approved by an
                administrator. You will receive an invitation email once approved.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <UserX className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">Account deactivated</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Your membership may have been deactivated. Contact a club
                administrator to reinstate access.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700">No member record</p>
              <p className="text-xs text-slate-500 mt-0.5">
                The email{email ? ` (${email})` : ""} on this account does not
                match any registered EPMOC member. Contact a club administrator.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <SignOutButton redirectUrl="/sign-in">
            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors">
              Sign out
            </button>
          </SignOutButton>
          <a
            href="mailto:epmoc@iiitu.ac.in"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Contact admin
          </a>
        </div>

      </div>
    </div>
  );
}
