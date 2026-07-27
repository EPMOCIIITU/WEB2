"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

const DEPARTMENTS = ["Designing", "PR", "Social Media", "Volunteering", "Coverage", "Technical"];
const BRANCHES = ["CSE", "DS", "CY", "IT", "ECE"];
const YEARS = [1, 2, 3, 4];

export default function JoinForm() {
  const [form, setForm] = useState({
    name: "",
    instituteEmail: "",
    phoneNumber: "",
    branch: "CSE",
    year: 1,
    department: "Technical",
    domain: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "year" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.instituteEmail || !form.phoneNumber || !form.domain) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          designation: "member",
          isApproved: false,
          isActive: true,
          clerkUserId: `pending_${form.instituteEmail}_${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="card p-14 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Application Received! 🎉
        </h2>
        <p className="text-slate-600 mb-6">
          Thank you for applying to EPMOC, <strong>{form.name}</strong>. Our team will review your application. You can now proceed to sign up for your account.
        </p>
        <div className="mt-8">
          <Link href="/sign-up" className="btn-primary justify-center w-full max-w-xs mx-auto text-base py-3">
            Proceed to Sign Up <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="join-name">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input id="join-name" name="name" value={form.name} onChange={handleChange} className="input" placeholder="e.g., Chirag Jain" required />
          </div>
          <div>
            <label className="label" htmlFor="join-email">
              Institute Email <span className="text-red-500">*</span>
            </label>
            <input id="join-email" name="instituteEmail" type="email" value={form.instituteEmail} onChange={handleChange} className="input" placeholder="XXXXX@iiitu.ac.in" required />
          </div>
          <div>
            <label className="label" htmlFor="join-phone">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input id="join-phone" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} className="input" placeholder="10-digit mobile number" required />
          </div>
          <div>
            <label className="label" htmlFor="join-branch">Branch</label>
            <select id="join-branch" name="branch" value={form.branch} onChange={handleChange} className="select">
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="join-year">Year</label>
            <select id="join-year" name="year" value={form.year} onChange={handleChange} className="select">
              {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="join-dept">Department of Interest</label>
            <select id="join-dept" name="department" value={form.department} onChange={handleChange} className="select">
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="join-domain">
              Skills / Domain <span className="text-red-500">*</span>
            </label>
            <input id="join-domain" name="domain" value={form.domain} onChange={handleChange} className="input" placeholder="e.g., Photography, Web Dev, Event Management" required />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="join-bio">Why do you want to join EPMOC?</label>
            <textarea id="join-bio" name="bio" value={form.bio} onChange={handleChange} rows={3} className="textarea" placeholder="Tell us a bit about yourself and your motivation…" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-base py-3">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
          ) : (
            <>Submit Application <ArrowRight className="w-4 h-4 ml-1" /></>
          )}
        </button>
      </form>
    </div>
  );
}
