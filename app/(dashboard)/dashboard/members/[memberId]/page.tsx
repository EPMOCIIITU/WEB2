import { BackButton } from "@/components/dashboard/BackButton";
import { connectDB } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";
import { cn, formatDate } from "@/lib/utils";
import Member from "@/models/Member";
import { CheckCircle2, Mail, Phone, User } from "lucide-react";
import type { Metadata } from "next";

interface MemberDetailsPageProps {
  params: Promise<{ memberId: string }>;
}

export const metadata: Metadata = { title: "Member Details" };

function DetailRow({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{String(value)}</p>
    </div>
  );
}

export default async function MemberDetailsPage({ params }: MemberDetailsPageProps) {
  await requirePermission("view_directory");
  const { memberId } = await params;

  await connectDB();
  const member = await Member.findById(memberId).lean();

  if (!member) {
    return (
      <div className="space-y-6">
        <BackButton />
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-900">Member not found</p>
          <p className="mt-2 text-sm text-slate-500">The requested member record does not exist.</p>
        </div>
      </div>
    );
  }

  const displayPicture = member.profilePicture ?? member.avatarUrl ?? null;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between gap-4">
        <BackButton />
        <div className="text-right">
          <h2 className="text-2xl font-bold text-slate-900">Member Details</h2>
          <p className="text-sm text-slate-500">Complete profile and directory information.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            {displayPicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayPicture}
                alt={member.name}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-slate-100"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 text-3xl font-semibold text-slate-400">
                {member.name.charAt(0).toUpperCase()}
              </div>
            )}

            <h1 className="mt-5 text-2xl font-bold text-slate-900">{member.name}</h1>
            <p className="mt-1 text-sm text-slate-500">{member.designation}</p>

            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-medium">
              <span className={cn("rounded-full px-3 py-1", member.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>{member.isApproved ? "Approved" : "Pending"}</span>
              <span className={cn("rounded-full px-3 py-1", member.isActive ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600")}>{member.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" />{member.instituteEmail}</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" />{member.phoneNumber}</div>
            <div className="flex items-center gap-2"><User className="h-4 w-4 text-slate-400" />Clerk User ID: {member.clerkUserId}</div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Profile Information</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DetailRow label="Name" value={member.name} />
            <DetailRow label="Institute Email" value={member.instituteEmail} />
            <DetailRow label="Phone Number" value={member.phoneNumber} />
            <DetailRow label="Department" value={member.department} />
            <DetailRow label="Branch" value={member.branch} />
            <DetailRow label="Year" value={member.year} />
            <DetailRow label="Designation / Role" value={member.designation} />
            <DetailRow label="Domain" value={member.domain} />
            <DetailRow label="Clerk User ID" value={member.clerkUserId} />
            <DetailRow label="Approval Status" value={member.isApproved ? "Approved" : "Pending"} />
            <DetailRow label="Active Status" value={member.isActive ? "Active" : "Inactive"} />
            <DetailRow label="Created At" value={formatDate(member.createdAt)} />
            <DetailRow label="Updated At" value={formatDate(member.updatedAt)} />
            <DetailRow label="Join Date" value={member.joinDate ? formatDate(member.joinDate) : null} />
            <DetailRow label="Legacy Role" value={member.role} />
            <DetailRow label="Legacy Status" value={member.status} />
            <DetailRow label="Bio" value={member.bio} />
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Additional fields
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <DetailRow label="Profile Picture" value={displayPicture ?? "Not set"} />
              <DetailRow label="Record ID" value={String(member._id)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}