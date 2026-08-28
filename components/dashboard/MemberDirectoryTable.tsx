"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MemberBranch, MemberDepartment, MemberDesignation, MemberYear } from "@/models/Member";

interface MemberDirectoryRow {
  id: string;
  profilePicture: string | null;
  name: string;
  instituteEmail: string;
  phoneNumber: string;
  designation: MemberDesignation;
  department: MemberDepartment;
  branch: MemberBranch;
  year: MemberYear;
  domain: string;
  clerkUserId: string | null | undefined;
  isApproved: boolean;
  isActive: boolean;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
  bio: string | null;
}

interface MemberDirectoryTableProps {
  members: MemberDirectoryRow[];
  defaultDepartment?: MemberDepartment | "all";
}

const DESIGNATION_OPTIONS: Array<MemberDesignation | "all"> = [
  "all",
  "president",
  "vice president",
  "Treasurer",
  "Head",
  "member",
];

const DEPARTMENT_OPTIONS: Array<MemberDepartment | "all"> = [
  "all",
  "Designing",
  "PR",
  "Social Media",
  "Volunteering",
  "Coverage",
  "Technical",
];

const BRANCH_OPTIONS: Array<MemberBranch | "all"> = ["all", "CSE", "DS", "CY", "IT", "ECE"];
const YEAR_OPTIONS: Array<MemberYear | "all"> = ["all", 1, 2, 3, 4];

const pageSize = 5;

export function MemberDirectoryTable({ members, defaultDepartment }: MemberDirectoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [designationFilter, setDesignationFilter] = useState<(typeof DESIGNATION_OPTIONS)[number]>("all");
  const [departmentFilter, setDepartmentFilter] = useState<(typeof DEPARTMENT_OPTIONS)[number]>(
    defaultDepartment ?? "all"
  );
  const [branchFilter, setBranchFilter] = useState<(typeof BRANCH_OPTIONS)[number]>("all");
  const [yearFilter, setYearFilter] = useState<(typeof YEAR_OPTIONS)[number]>("all");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "approved" | "pending">("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMembers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        query.length === 0 ||
        member.name.toLowerCase().includes(query) ||
        member.instituteEmail.toLowerCase().includes(query);

      const matchesDesignation = designationFilter === "all" || member.designation === designationFilter;
      const matchesDepartment = departmentFilter === "all" || member.department === departmentFilter;
      const matchesBranch = branchFilter === "all" || member.branch === branchFilter;
      const matchesYear = yearFilter === "all" || member.year === yearFilter;
      const matchesApproval =
        approvalFilter === "all" ||
        (approvalFilter === "approved" ? member.isApproved : !member.isApproved);
      const matchesActive =
        activeFilter === "all" ||
        (activeFilter === "active" ? member.isActive : !member.isActive);

      return (
        matchesSearch &&
        matchesDesignation &&
        matchesDepartment &&
        matchesBranch &&
        matchesYear &&
        matchesApproval &&
        matchesActive
      );
    });
  }, [
    activeFilter,
    approvalFilter,
    branchFilter,
    departmentFilter,
    designationFilter,
    members,
    searchTerm,
    yearFilter,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, designationFilter, departmentFilter, branchFilter, yearFilter, approvalFilter, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedMembers = filteredMembers.slice((safePage - 1) * pageSize, safePage * pageSize);
  const [selectedMember, setSelectedMember] = useState<MemberDirectoryRow | null>(null);

  const clearFilters = () => {
    setSearchTerm("");
    setDesignationFilter("all");
    setDepartmentFilter("all");
    setBranchFilter("all");
    setYearFilter("all");
    setApprovalFilter("all");
    setActiveFilter("all");
  };

  const filtersActive =
    searchTerm ||
    designationFilter !== "all" ||
    departmentFilter !== "all" ||
    branchFilter !== "all" ||
    yearFilter !== "all" ||
    approvalFilter !== "all" ||
    activeFilter !== "all";

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-4">
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 lg:col-span-2">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name or institute email"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>

        <select
          value={designationFilter}
          onChange={(event) => setDesignationFilter(event.target.value as typeof designationFilter)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
        >
          {DESIGNATION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All Designations" : option}
            </option>
          ))}
        </select>

        <select
          value={departmentFilter}
          onChange={(event) => setDepartmentFilter(event.target.value as typeof departmentFilter)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
        >
          {DEPARTMENT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All Departments" : option}
            </option>
          ))}
        </select>

        <select
          value={branchFilter}
          onChange={(event) => setBranchFilter(event.target.value as typeof branchFilter)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
        >
          {BRANCH_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option === "all" ? "All Branches" : option}
            </option>
          ))}
        </select>

        <select
          value={yearFilter}
          onChange={(event) => setYearFilter(event.target.value as typeof yearFilter)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
        >
          {YEAR_OPTIONS.map((option) => (
            <option key={String(option)} value={option}>
              {option === "all" ? "All Years" : `Year ${option}`}
            </option>
          ))}
        </select>

        <select
          value={approvalFilter}
          onChange={(event) => setApprovalFilter(event.target.value as typeof approvalFilter)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
        >
          <option value="all">All Approval Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>

        <select
          value={activeFilter}
          onChange={(event) => setActiveFilter(event.target.value as typeof activeFilter)}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none"
        >
          <option value="all">All Active Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          type="button"
          onClick={clearFilters}
          disabled={!filtersActive}
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm font-medium transition lg:col-span-2",
            filtersActive
              ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
          )}
        >
          Clear Filters
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Profile Picture</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Year</th>
                <th className="px-6 py-4">Phone Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-14 text-center text-sm text-slate-500">
                    No members match the current filters.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member) => (
                  <tr key={member.id} className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {member.profilePicture ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={member.profilePicture}
                            alt={member.name}
                            className="h-12 w-12 rounded-2xl object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 font-semibold text-slate-400">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedMember(member)}
                        className="text-left font-semibold text-slate-900 transition hover:text-slate-600"
                      >
                        {member.name}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">Year {member.year}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{member.phoneNumber}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing {filteredMembers.length === 0 ? 0 : (safePage - 1) * pageSize + 1} to {Math.min(safePage * pageSize, filteredMembers.length)} of {filteredMembers.length} members
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={safePage <= 1}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={safePage >= totalPages}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Member Profile</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">{selectedMember.name}</h3>
                <p className="mt-1 text-sm text-slate-500">Click outside or use close to return to the table.</p>
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

            <div className="overflow-y-auto flex-1 grid gap-6 p-6 lg:grid-cols-[240px_minmax(0,1fr)]">
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

                <div className="mt-4 space-y-2">
                  <p className="text-lg font-semibold text-slate-900">{selectedMember.designation}</p>
                  <p className="text-sm text-slate-500">{selectedMember.domain}</p>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs font-medium">
                  <span className={cn("rounded-full px-3 py-1", selectedMember.isApproved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>{selectedMember.isApproved ? "Approved" : "Pending"}</span>
                  <span className={cn("rounded-full px-3 py-1", selectedMember.isActive ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600")}>{selectedMember.isActive ? "Active" : "Inactive"}</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Name", selectedMember.name],
                  ["Institute Email", selectedMember.instituteEmail],
                  ["Phone Number", selectedMember.phoneNumber],
                  ["Department", selectedMember.department],
                  ["Branch", selectedMember.branch],
                  ["Year", `Year ${selectedMember.year}`],
                  ["Designation / Role", selectedMember.designation],
                  ["Domain", selectedMember.domain],
                  ["Clerk User ID", selectedMember.clerkUserId],
                  ["Approval Status", selectedMember.isApproved ? "Approved" : "Pending"],
                  ["Active Status", selectedMember.isActive ? "Active" : "Inactive"],
                  ["Join Date", selectedMember.joinDate],
                  ["Created At", selectedMember.createdAt],
                  ["Updated At", selectedMember.updatedAt],
                ].map(([label, value]) => (
                  <div key={label as string} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">{String(value)}</p>
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
    </div>
  );
}