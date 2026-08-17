/**
 * lib/roles.ts — Shared role metadata
 *
 * This file is safe to import from both Server and Client Components.
 */

export type UserRole = "president" | "core" | "member";

export const ROLE_LABELS: Record<UserRole, string> = {
  president: "President",
  core: "Core Member",
  member: "Member",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  president: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  core: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  member: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};