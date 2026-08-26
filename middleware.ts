/**
 * middleware.ts — Next.js Edge Middleware
 *
 * Uses Clerk's `clerkMiddleware` to:
 *   1. Protect all /dashboard/* routes — redirect unauthenticated users to /sign-in
 *   2. Allow public routes (/, /sign-in/*, /api/webhook/*) without auth
 *
 * NOTE: /sign-up is intentionally NOT in the public list.
 * The application is invite-only — public self-registration is disabled.
 * The Clerk dashboard must also have "Restrict sign-ups" enabled so that
 * even direct Clerk-hosted sign-up URLs are blocked.
 *
 * MongoDB membership/approval checks are NOT performed here (Edge runtime
 * cannot run Mongoose). Those checks happen in:
 *   - app/(dashboard)/layout.tsx  (server layout guard)
 *   - lib/auth/requireApprovedMember.ts (reusable server-side helper)
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// ── Define which routes are publicly accessible ────────────────────────────
const isPublicRoute = createRouteMatcher([
  "/",                  // Landing page
  "/about(.*)",         // Public about page
  "/contact(.*)",       // Public contact page
  "/events(.*)",        // Public events listing
  "/join(.*)",          // Public join/info page
  "/team(.*)",          // Public team page
  "/sign-in(.*)",       // Clerk sign-in (supports sub-paths for factors/MFA)
  // /sign-up is intentionally EXCLUDED — invite-only system
  "/access-denied",     // Shown to authenticated-but-unapproved users
  "/api/webhook(.*)",   // Clerk/Svix webhook endpoint (signed, no Clerk session)
  "/api/health(.*)",    // Health check endpoints
]);

// ── Define dashboard routes that need protection ───────────────────────────
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // Protect dashboard routes: unauthenticated users are redirected to /sign-in
  if (isDashboardRoute(request)) {
    await auth.protect();
  }

  // All other routes pass through; public pages are open to everyone.
  // Approved-member enforcement happens at the server layout level, not here,
  // to avoid running Mongoose inside the Edge runtime.
  return NextResponse.next();
});

export const config = {
  // Run middleware on ALL routes except Next.js internals and static files.
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
