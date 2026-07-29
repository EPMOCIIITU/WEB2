"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, UserPlus } from "lucide-react";

const DESIGNATIONS = [
  "president",
  "vice president",
  "Treasurer",
  "General Secretary",
  "Joint Secretary",
  "Core Advisor",
  "Head",
  "member",
];
const DEPARTMENTS = ["Designing", "PR", "Social Media", "Volunteering", "Coverage", "Technical"];
const BRANCHES = ["CSE", "DS", "CY", "IT", "ECE"];
const YEARS = [1, 2, 3, 4];

export default function AddMemberModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    instituteEmail: "",
    phoneNumber: "",
    department: "Technical",
    branch: "CSE",
    year: 1,
    designation: "member",
    domain: "",
    bio: "",
    isApproved: false,
    isActive: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : name === "year"
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.instituteEmail || !form.phoneNumber || !form.domain) {
      setError("Name, email, phone, and domain are required.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to add member");
        router.refresh();
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm overflow-y-auto py-8">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200 my-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-indigo-500" />
            <h3 className="font-display font-bold text-slate-900">Add Member</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Full Name <span className="text-rose-500">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="e.g., Chirag Jain" required />
            </div>
            <div>
              <label className="label">Institute Email <span className="text-rose-500">*</span></label>
              <input name="instituteEmail" type="email" value={form.instituteEmail} onChange={handleChange} className="input" placeholder="23XXX@iiitu.ac.in" required />
            </div>
            <div>
              <label className="label">Phone Number <span className="text-rose-500">*</span></label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="input" placeholder="10-digit number" required />
            </div>
            <div>
              <label className="label">Department</label>
              <select name="department" value={form.department} onChange={handleChange} className="select">
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Branch</label>
              <select name="branch" value={form.branch} onChange={handleChange} className="select">
                {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Year</label>
              <select name="year" value={form.year} onChange={handleChange} className="select">
                {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Designation</label>
              <select name="designation" value={form.designation} onChange={handleChange} className="select">
                {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Domain / Skills <span className="text-rose-500">*</span></label>
              <input name="domain" value={form.domain} onChange={handleChange} className="input" placeholder="e.g., Web Dev, Photography" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Bio</label>
              <textarea name="bio" value={form.bio} onChange={handleChange} rows={2} className="textarea" placeholder="Short bio (optional)" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isApproved" checked={form.isApproved} onChange={handleChange} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-slate-700">Mark as Approved</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} className="w-4 h-4 rounded" />
              <span className="text-sm font-medium text-slate-700">Active</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <button type="submit" disabled={isPending} className="btn-primary">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {isPending ? "Adding…" : "Add Member"}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
