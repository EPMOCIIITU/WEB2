/**
 * app/(dashboard)/dashboard/profile/page.tsx — My Profile Page
 *
 * Available to all authenticated roles.
 * Shows the current user's Clerk profile data and their DB member record.
 */

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import { getCurrentUserRole } from "@/lib/rbac";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/roles";
import { formatDate, cn } from "@/lib/utils";
import { Mail, Building2, Calendar, User, Shield } from "lucide-react";
import type { Metadata } from "next";
import EditProfileModal from "./EditProfileModal";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const role = await getCurrentUserRole();

  // Look up the user's DB record (may not exist yet if seed hasn't run)
  let memberRecord = null;
  try {
    await connectDB();
    memberRecord = await Member.findOne({ clerkId: user.id }).lean();
  } catch {
    // DB not connected yet
  }

  const displayName = user.fullName ?? user.username ?? "Club Member";
  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const avatarUrl = user.imageUrl;

  return (
    <div className="max-w-2xl space-y-6">
      {/* ── Profile Card ─────────────────────────────────────────── */}
      <div className="glass-card relative p-8 flex flex-col sm:flex-row gap-6 items-start">
        <EditProfileModal 
          initialBio={memberRecord?.bio ?? ""} 
          initialDepartment={memberRecord?.department ?? ""} 
        />
        {/* Avatar */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-24 h-24 rounded-2xl ring-4 ring-brand-500/30 object-cover"
        />

        <div className="flex-1">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">
            {displayName}
          </h2>
          <span className={cn("role-badge mb-3", ROLE_COLORS[role])}>
            {ROLE_LABELS[role]}
          </span>

          <div className="space-y-2 mt-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail className="w-4 h-4 text-brand-400" />
              <span>{email}</span>
            </div>
            {memberRecord?.department && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Building2 className="w-4 h-4 text-brand-400" />
                <span>{memberRecord.department}</span>
              </div>
            )}
            {memberRecord?.joinDate && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4 text-brand-400" />
                <span>Joined {formatDate(memberRecord.joinDate as Date)}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <User className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-mono text-slate-500 dark:text-slate-500 truncate">
                ID: {user.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bio ───────────────────────────────────────────────────── */}
      {memberRecord?.bio && (
        <div className="glass-card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-400" />
            About
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{memberRecord.bio}</p>
        </div>
      )}

      {/* ── Permissions ───────────────────────────────────────────── */}
      <div className="glass-card p-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-400" />
          Your Permissions
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            { label: "View Directory",  allowed: true },
            { label: "View Profile",    allowed: true },
            { label: "Edit Members",    allowed: role !== "member" },
            { label: "View Analytics",  allowed: role !== "member" },
            { label: "Manage Members",  allowed: role === "president" },
            { label: "Delete Members",  allowed: role === "president" },
            { label: "Club Settings",   allowed: role === "president" },
          ].map(({ label, allowed }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                allowed ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
              )} />
              <span className={allowed ? "text-slate-700 dark:text-slate-300" : "text-slate-400 dark:text-slate-600"}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Manage Profile via Clerk ──────────────────────────────── */}
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
        To update your name, email, or avatar, use the{" "}
        <button
          className="text-brand-500 hover:underline"
          onClick={undefined}
        >
          profile menu
        </button>{" "}
        in the bottom-left of the sidebar.
      </p>
    </div>
  );
}
