"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  UserCog,
  Trash2,
  Crown,
  UserPlus,
  Loader2,
  CheckCircle2,
  XCircle,
  Send,
  Search,
  X,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import EditMemberModal from "./EditMemberModal";
import AddMemberModal from "./AddMemberModal";
import AssignHeadModal from "./AssignHeadModal";
import type {
  MemberDesignation,
  MemberDepartment,
  MemberBranch,
  MemberYear,
} from "@/models/Member";

// ── Types ─────────────────────────────────────────────────────────────────

interface MemberRow {
  id:             string;
  name:           string;
  email:          string;
  instituteEmail: string;
  phoneNumber:    string;
  rollNumber:     string;
  hostel:         string;
  designation:    MemberDesignation;
  department:     MemberDepartment;
  branch:         MemberBranch;
  year:           MemberYear;
  domain:         string;
  profilePicture: string | null;
  clerkUserId:    string | null | undefined;
  isApproved:     boolean;
  isActive:       boolean;
  joinDate:       string;
  createdAt:      string;
  updatedAt:      string;
  bio?:           string | null;
}

interface ManageMembersClientProps {
  members:            MemberRow[];
  defaultDepartment?: MemberDepartment | "all";
  isPresident?:       boolean;
}

// ── Filter options ────────────────────────────────────────────────────────

const DESIGNATION_OPTIONS: Array<MemberDesignation | "all"> = [
  "all", "president", "vice president", "Treasurer", "Secretary", "Head", "member",
];
const DEPARTMENT_OPTIONS: Array<MemberDepartment | "all"> = [
  "all", "Designing", "PR", "Social Media", "Volunteering",
  "Coverage", "Technical", "Decoration", "Content",
];
const BRANCH_OPTIONS: Array<MemberBranch | "all"> = [
  "all", "CSE", "DS", "CY", "IT", "ECE",
];
const YEAR_OPTIONS: Array<MemberYear | "all"> = ["all", 1, 2, 3, 4];

const PAGE_SIZE = 10;

// ── Sub-components ────────────────────────────────────────────────────────

function DeleteButton({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [confirming, setConfirming]  = useState(false);
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

function ApproveButton({ memberId, memberName }: { memberId: string; memberName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone]   = useState(false);

  const handleApprove = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res  = await fetch(`/api/members/${memberId}/approve`, { method: "POST" });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? "Approval failed"); return; }
        setDone(true);
        router.refresh();
      } catch {
        setError("Network error — please try again.");
      }
    });
  };

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
        <Send className="w-3 h-3" /> Invited
      </span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleApprove}
        disabled={isPending}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium transition-all",
          isPending
            ? "bg-indigo-100 text-indigo-400 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        )}
        title={`Approve ${memberName} and send Clerk invitation`}
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
        {isPending ? "Sending…" : "Approve"}
      </button>
      {error && (
        <span className="text-xs text-rose-600 max-w-[160px] leading-tight">{error}</span>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function ManageMembersClient({ members, defaultDepartment, isPresident = false }: ManageMembersClientProps) {
  // ── Filter state ────────────────────────────────────────────────────────
  const [searchTerm,        setSearchTerm]        = useState("");
  const [designationFilter, setDesignationFilter] = useState<(typeof DESIGNATION_OPTIONS)[number]>("all");
  const [departmentFilter,  setDepartmentFilter]  = useState<(typeof DEPARTMENT_OPTIONS)[number]>(
    defaultDepartment ?? "all"
  );
  const [branchFilter,      setBranchFilter]      = useState<(typeof BRANCH_OPTIONS)[number]>("all");
  const [yearFilter,        setYearFilter]        = useState<(typeof YEAR_OPTIONS)[number]>("all");
  const [approvalFilter,    setApprovalFilter]    = useState<"all" | "approved" | "pending">("all");
  const [activeFilter,      setActiveFilter]      = useState<"all" | "active" | "inactive">("all");
  const [currentPage,       setCurrentPage]       = useState(1);

  // ── Modal state ─────────────────────────────────────────────────────────
  const [editingMember,     setEditingMember]     = useState<MemberRow | null>(null);
  const [showAddModal,      setShowAddModal]       = useState(false);
  const [selectedMember,    setSelectedMember]    = useState<MemberRow | null>(null);
  const [assigningHeadFor,  setAssigningHeadFor]  = useState<MemberRow | null>(null);

  // ── Filtering ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return members.filter((m) => {
      if (q && !m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q)) return false;
      if (designationFilter !== "all" && m.designation !== designationFilter) return false;
      if (departmentFilter  !== "all" && m.department  !== departmentFilter)  return false;
      if (branchFilter      !== "all" && m.branch      !== branchFilter)      return false;
      if (yearFilter        !== "all" && m.year        !== yearFilter)         return false;
      if (approvalFilter === "approved" && !m.isApproved)  return false;
      if (approvalFilter === "pending"  &&  m.isApproved)  return false;
      if (activeFilter   === "active"   && !m.isActive)    return false;
      if (activeFilter   === "inactive" &&  m.isActive)    return false;
      return true;
    });
  }, [members, searchTerm, designationFilter, departmentFilter, branchFilter, yearFilter, approvalFilter, activeFilter]);

  // Reset to page 1 whenever filters change
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(currentPage, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const filtersActive =
    searchTerm || designationFilter !== "all" || departmentFilter !== "all" ||
    branchFilter !== "all" || yearFilter !== "all" ||
    approvalFilter !== "all" || activeFilter !== "all";

  const clearFilters = () => {
    setSearchTerm(""); setDesignationFilter("all"); setDepartmentFilter("all");
    setBranchFilter("all"); setYearFilter("all");
    setApprovalFilter("all"); setActiveFilter("all");
    setCurrentPage(1);
  };

  const pendingCount  = members.filter((m) => !m.isApproved).length;
  const approvedCount = members.filter((m) =>  m.isApproved).length;

  return (
    <>
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Crown className="w-5 h-5 text-amber-500" />
            <h1 className="font-display text-2xl font-bold text-slate-900">Manage Members</h1>
          </div>
          <p className="text-slate-500 text-sm">
            {members.length} total · {approvedCount} approved · {pendingCount} pending
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                {pendingCount} awaiting approval
              </span>
            )}
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">
          <UserPlus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-4 lg:grid-cols-4">
        {/* Search — spans 2 cols */}
        <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 lg:col-span-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Search by name or email"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <select
          value={designationFilter}
          onChange={(e) => { setDesignationFilter(e.target.value as typeof designationFilter); setCurrentPage(1); }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
        >
          {DESIGNATION_OPTIONS.map((o) => (
            <option key={o} value={o}>{o === "all" ? "All Designations" : o}</option>
          ))}
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => { setDepartmentFilter(e.target.value as typeof departmentFilter); setCurrentPage(1); }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
        >
          {DEPARTMENT_OPTIONS.map((o) => (
            <option key={o} value={o}>{o === "all" ? "All Departments" : o}</option>
          ))}
        </select>

        <select
          value={branchFilter}
          onChange={(e) => { setBranchFilter(e.target.value as typeof branchFilter); setCurrentPage(1); }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
        >
          {BRANCH_OPTIONS.map((o) => (
            <option key={o} value={o}>{o === "all" ? "All Branches" : o}</option>
          ))}
        </select>

        <select
          value={String(yearFilter)}
          onChange={(e) => { setYearFilter(e.target.value === "all" ? "all" : Number(e.target.value) as MemberYear); setCurrentPage(1); }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
        >
          {YEAR_OPTIONS.map((o) => (
            <option key={String(o)} value={o}>{o === "all" ? "All Years" : `Year ${o}`}</option>
          ))}
        </select>

        <select
          value={approvalFilter}
          onChange={(e) => { setApprovalFilter(e.target.value as typeof approvalFilter); setCurrentPage(1); }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
        >
          <option value="all">All Approval Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>

        <select
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value as typeof activeFilter); setCurrentPage(1); }}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
        >
          <option value="all">All Active Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          onClick={clearFilters}
          disabled={!filtersActive}
          className={cn(
            "rounded-xl border px-4 py-3 text-sm font-medium transition lg:col-span-2",
            filtersActive
              ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
          )}
        >
          Clear Filters
        </button>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
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
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-slate-400">
                    {filtersActive
                      ? "No members match the current filters."
                      : <>No members yet — click <strong>Add Member</strong> to create the first one.</>}
                  </td>
                </tr>
              ) : (
                paginated.map((member) => (
                  <tr
                    key={member.id}
                    className={cn(
                      "hover:bg-slate-50 transition-colors",
                      !member.isApproved && "bg-amber-50/40"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => setSelectedMember(member)}
                            className="font-medium text-slate-900 hover:text-indigo-600 transition-colors text-left"
                          >
                            {member.name}
                          </button>
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
                      <div className="flex items-center justify-end gap-2">
                        {!member.isApproved && (
                          <ApproveButton memberId={member.id} memberName={member.name} />
                        )}
                        {/* Assign as Head — president only, member must be approved+active */}
                        {isPresident && member.isApproved && member.isActive && (
                          <button
                            onClick={() => setAssigningHeadFor(member)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                            title={`Assign ${member.name} as head of ${member.department}`}
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                        )}
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

        {/* ── Pagination ────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {filtered.length === 0
              ? "No results"
              : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Modals ───────────────────────────────────────────────────── */}
      {editingMember && (
        <EditMemberModal member={editingMember} onClose={() => setEditingMember(null)} />
      )}
      {showAddModal && (
        <AddMemberModal onClose={() => setShowAddModal(false)} />
      )}
      {assigningHeadFor && (
        <AssignHeadModal
          member={{
            id:         assigningHeadFor.id,
            name:       assigningHeadFor.name,
            department: assigningHeadFor.department,
          }}
          onClose={() => setAssigningHeadFor(null)}
        />
      )}

      {/* ── Member profile card (same as MemberDirectoryTable) ───────── */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Member Profile</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">{selectedMember.name}</h3>
                <p className="mt-1 text-sm text-slate-500">Click outside or press close to dismiss.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
                aria-label="Close member card"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 grid gap-6 p-6 lg:grid-cols-[240px_minmax(0,1fr)]">
              {/* Left: avatar + badges */}
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center">
                {selectedMember.profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedMember.profilePicture}
                    alt={selectedMember.name}
                    className="mx-auto h-32 w-32 rounded-full object-cover ring-4 ring-white"
                  />
                ) : (
                  <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-slate-100 text-4xl font-semibold text-slate-400">
                    {selectedMember.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="mt-4 space-y-1">
                  <p className="text-lg font-semibold text-slate-900 capitalize">{selectedMember.designation}</p>
                  <p className="text-sm text-slate-500">{selectedMember.domain}</p>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-medium">
                  <span className={cn("rounded-full px-3 py-1", selectedMember.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                    {selectedMember.isApproved ? "Approved" : "Pending"}
                  </span>
                  <span className={cn("rounded-full px-3 py-1", selectedMember.isActive ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600")}>
                    {selectedMember.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Right: detail fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  ["Name",              selectedMember.name],
                  ["Institute Email",   selectedMember.instituteEmail],
                  ["Phone Number",      selectedMember.phoneNumber],
                  ["Roll Number",       selectedMember.rollNumber],
                  ["Hostel",            selectedMember.hostel],
                  ["Department",        selectedMember.department],
                  ["Branch",            selectedMember.branch],
                  ["Year",              `Year ${selectedMember.year}`],
                  ["Designation / Role",selectedMember.designation],
                  ["Domain",            selectedMember.domain],
                  ["Clerk User ID",     selectedMember.clerkUserId ?? "—"],
                  ["Approval Status",   selectedMember.isApproved ? "Approved" : "Pending"],
                  ["Active Status",     selectedMember.isActive ? "Active" : "Inactive"],
                  ["Join Date",         selectedMember.joinDate],
                  ["Created At",        selectedMember.createdAt],
                  ["Updated At",        selectedMember.updatedAt],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-900 break-all">{value}</p>
                  </div>
                ))}

                {selectedMember.bio && (
                  <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bio</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{selectedMember.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
