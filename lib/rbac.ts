/**
 * lib/rbac.ts — Role-Based Access Control (RBAC) Utilities
 *
 * HOW ROLES WORK WITH CLERK:
 *   Roles are stored in Clerk's user `publicMetadata` as:
 *     { role: "president" | "core" | "member" }
 *
 *   You set a user's role from the Clerk Dashboard → Users → Metadata, or
 *   programmatically via the Clerk Backend SDK in a Server Action/API route.
 *
 * ROLE HIERARCHY:
 *   president > core > member
 *
 * USAGE EXAMPLES:
 *
 *   // In a Server Component or Server Action:
 *   const role = await getCurrentUserRole();
 *   if (!hasPermission(role, "manage_members")) redirect("/dashboard");
 *
 *   // Or use the guard shorthand:
 *   await requirePermission("manage_members");
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { UserRole } from "./roles";

/**
 * All actions in the application. Map each action to a minimum required role.
 * Use fine-grained actions instead of raw role checks in your components so
 * that adjusting permissions only requires a change here.
 */
export type Action =
  | "manage_members"     // president only
  | "delete_member"      // president only
  | "edit_member"        // president + core
  | "view_analytics"     // president + core
  | "view_directory"     // all authenticated users
  | "view_profile"      // all authenticated users
  | "assign_tasks";     // president + core (Heads)

// ── Permission Matrix ─────────────────────────────────────────────────────
/**
 * Maps each action to the minimum role level required.
 * Roles are checked inclusively: president can do everything core can, etc.
 */
const PERMISSIONS: Record<Action, UserRole[]> = {
  manage_members:  ["president"],
  delete_member:   ["president"],
  edit_member:     ["president", "core"],
  view_analytics:  ["president", "core"],
  view_directory:  ["president", "core", "member"],
  view_profile:    ["president", "core", "member"],
  assign_tasks:    ["president", "core"],
};

// ── Helper: check if role has permission ─────────────────────────────────
export function hasPermission(role: UserRole | null, action: Action): boolean {
  if (!role) return false;
  return PERMISSIONS[action].includes(role);
}

// ── Get the current user's role from Clerk metadata ──────────────────────
/**
 * Returns the role from the authenticated user's publicMetadata.
 * Falls back to "member" if no role is set (safe default).
 * Call this only in Server Components or Server Actions.
 */
export async function getCurrentUserRole(): Promise<UserRole> {
  const user = await currentUser();
  if (!user) return "member";

  const role = user.publicMetadata?.role as UserRole | undefined;
  // Default to "member" if no role has been assigned yet
  return role ?? "member";
}

// ── Guard: redirect if user lacks the required permission ────────────────
/**
 * Server-side guard. Call at the top of a page or action to enforce access.
 *
 * @example
 * // At the top of /dashboard/members/page.tsx
 * await requirePermission("view_directory");
 */
export async function requirePermission(
  action: Action,
  redirectTo: string = "/dashboard"
): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const role = await getCurrentUserRole();
  if (!hasPermission(role, action)) {
    redirect(redirectTo);
  }
}

// ── Utility: Get Clerk userId safely (throws if unauthenticated) ─────────
export async function getAuthenticatedUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return userId;
}
