"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserCog, Trash2, Crown, UserPlus, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import EditMemberModal from "./EditMemberModal";
import AddMemberModal from "./AddMemberModal";
import type { MemberDesignation, MemberDepartment, MemberBranch, MemberYear } from "@/models/Member";

interface MemberRow {
  id: string;
  name: string;
  email: string;
  designation: MemberDesignation;
  department: MemberDepartment;
  branch: MemberBranch;
  year: MemberYear;
  domain: string;
  isApproved: boolean;
  isActive: boolean;
  joinDate: string;
  bio?: string | null;
}

interface ManageMembersClientProps {
  members: MemberRow[];
}

function DeleteButton({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await fetch(`/api/members/${memberId}`, { method: "DELETE" });
      setConfirming(false);
      router.refresh();
    });
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-xs px-2 py-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-all"
        >
          {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
      title="Delete member"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

export default function ManageMembersClient({ members }: ManageMembersClientProps) {
  const [editingMember, setEditingMember] = useState<MemberRow | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-amber-500" />
            <h1 className="font-display text-2xl font-bold text-slate-900">Manage Members</h1>
          </div>
          <p className="text-slate-500 text-sm">
            {members.length} total member{members.length !== 1 ? "s" : ""} · President-only view
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-slate-50">
                <th className="text-left px-6 py-4">Member</th>
                <th className="text-left px-6 py-4">Role</th>
                <th className="text-left px-6 py-4">Dept / Branch</th>
                <th className="text-left px-6 py-4">Joined</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-slate-400">
                    No members yet — run{" "}
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">npm run seed</code>
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{member.name}</p>
                          <p className="text-xs text-slate-400">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
                        {member.designation}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      <p>{member.department}</p>
                      <p className="text-xs">{member.branch} · Yr {member.year}</p>
                    </td>

                    <td className="px-6 py-4 text-slate-500 text-xs">{member.joinDate}</td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium",
                          member.isApproved ? "text-emerald-600" : "text-amber-600"
                        )}>
                          {member.isApproved
                            ? <CheckCircle2 className="w-3 h-3" />
                            : <XCircle className="w-3 h-3" />}
                          {member.isApproved ? "Approved" : "Pending"}
                        </span>
                        <span className={cn(
                          "inline-flex items-center gap-1 text-xs font-medium",
                          member.isActive ? "text-sky-600" : "text-slate-400"
                        )}>
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingMember(member)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          title="Edit member"
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                        <DeleteButton memberId={member.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
        />
      )}

      {/* Add modal */}
      {showAddModal && (
        <AddMemberModal onClose={() => setShowAddModal(false)} />
      )}
    </>
  );
}
