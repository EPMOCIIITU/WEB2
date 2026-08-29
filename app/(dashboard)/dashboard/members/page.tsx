/**
 * app/(dashboard)/dashboard/members/page.tsx — Member Directory
 *
 * Accepts an optional ?department= search param so that links from the
 * Departments page pre-filter the table to the selected department.
 */

import { BackButton } from "@/components/dashboard/BackButton";
import ManageMembersClient from "@/components/dashboard/ManageMembersClient";
import { connectDB } from "@/lib/db";
import { requirePermission, getCurrentUserRole } from "@/lib/rbac";
import Member from "@/models/Member";
import DepartmentHead from "@/models/DepartmentHead";
import type { MemberDepartment } from "@/models/Member";
import { formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Member Directory" };

const VALID_DEPARTMENTS: MemberDepartment[] = [
  "Designing", "PR", "Social Media", "Volunteering",
  "Coverage", "Technical", "Decoration", "Content",
];

async function getMembers() {
  await connectDB();
  const [members, headAssignments] = await Promise.all([
    Member.find({}).sort({ createdAt: -1 }).lean(),
    DepartmentHead.find({}).select("member").lean(),
  ]);

  const headIds = new Set(headAssignments.map((a) => String(a.member)));

  return members.map((member) => ({
    id:             String(member._id),
    profilePicture: member.profilePicture ?? member.avatarUrl ?? null,
    name:           member.name,
    email:          member.instituteEmail ?? member.email ?? "",
    instituteEmail: member.instituteEmail,
    phoneNumber:    member.phoneNumber,
    rollNumber:     (member as unknown as { rollNumber?: string }).rollNumber ?? "",
    hostel:         (member as unknown as { hostel?: string }).hostel ?? "",
    designation:    member.designation,
    department:     member.department,
    branch:         member.branch,
    year:           member.year,
    domain:         member.domain,
    clerkUserId:    member.clerkUserId,
    isApproved:     member.isApproved,
    isActive:       member.isActive,
    isHead:         headIds.has(String(member._id)),
    joinDate:       formatDate(member.joinDate),
    createdAt:      formatDate(member.createdAt),
    updatedAt:      formatDate(member.updatedAt),
    bio:            member.bio ?? null,
  }));
}

interface MembersPageProps {
  searchParams: Promise<{ department?: string }>;
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  await requirePermission("view_directory");
  const role = await getCurrentUserRole();

  const { department } = await searchParams;
  const defaultDepartment = VALID_DEPARTMENTS.includes(department as MemberDepartment)
    ? (department as MemberDepartment)
    : undefined;

  let members: Awaited<ReturnType<typeof getMembers>> = [];
  try {
    members = await getMembers();
  } catch {
    members = [];
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between gap-4">
        <BackButton />
        <div className="text-right">
          <h2 className="text-2xl font-bold text-slate-900">Member Directory</h2>
          <p className="text-sm text-slate-500">
            Browse members, search by name or email, and open full profiles.
          </p>
        </div>
      </div>

      <ManageMembersClient members={members} defaultDepartment={defaultDepartment} isPresident={role === "president"} />
    </div>
  );
}
