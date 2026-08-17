/**
 * app/(dashboard)/dashboard/members/page.tsx — Member Directory
 */

import { BackButton } from "@/components/dashboard/BackButton";
import { MemberDirectoryTable } from "@/components/dashboard/MemberDirectoryTable";
import { connectDB } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import Member from "@/models/Member";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";
import MembersPageClient from "@/components/dashboard/MembersPageClient";

export const metadata: Metadata = { title: "Member Directory" };

async function getMembers() {
  await connectDB();
  const members = await Member.find({}).sort({ createdAt: -1 }).lean();

  return members.map((member) => ({
    id: String(member._id),
    profilePicture: member.profilePicture ?? member.avatarUrl ?? null,
    name: member.name,
    instituteEmail: member.instituteEmail,
    phoneNumber: member.phoneNumber,
    designation: member.designation,
    department: member.department,
    branch: member.branch,
    year: member.year,
    domain: member.domain,
    clerkUserId: member.clerkUserId,
    isApproved: member.isApproved,
    isActive: member.isActive,
    joinDate: formatDate(member.joinDate),
    createdAt: formatDate(member.createdAt),
    updatedAt: formatDate(member.updatedAt),
    bio: member.bio ?? null,
  }));
}

export default async function MembersPage() {
  await requirePermission("view_directory");

  let members: Awaited<ReturnType<typeof getMembers>> = [];
  try {
    members = await getMembers();
  } catch {
    members = [];
  }

  return (
  <div className="space-y-6 pb-8">
    <div className="flex items-center gap-4">
      <BackButton />
    </div>
    <p className="text-sm text-slate-500">
      Browse members, search by name or email, and open full profiles.
    </p>
    <MembersPageClient members={members} />
  </div>
);

}