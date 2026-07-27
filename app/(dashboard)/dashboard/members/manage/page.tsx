/**
 * app/(dashboard)/dashboard/members/manage/page.tsx
 * — Manage Members Page (President Only)
 */

import { requirePermission } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import Member from "@/models/Member";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import ManageMembersClient from "@/components/dashboard/ManageMembersClient";

export const metadata: Metadata = { title: "Manage Members" };

async function getAllMembers() {
  await connectDB();
  return Member.find({}).sort({ designation: 1, joinDate: -1 }).lean();
}

export default async function ManageMembersPage() {
  await requirePermission("manage_members");

  let raw: Awaited<ReturnType<typeof getAllMembers>> = [];
  try {
    raw = await getAllMembers();
  } catch {
    // DB offline
  }

  const members = raw.map((m) => ({
    id: String(m._id),
    name: m.name,
    email: m.instituteEmail ?? m.email ?? "",
    designation: m.designation,
    department: m.department,
    branch: m.branch,
    year: m.year,
    domain: m.domain,
    isApproved: m.isApproved,
    isActive: m.isActive,
    joinDate: formatDate(m.joinDate ?? m.createdAt),
    bio: m.bio ?? null,
  }));

  return (
    <div className="space-y-0 animate-fade-in">
      <ManageMembersClient members={members} />
    </div>
  );
}
