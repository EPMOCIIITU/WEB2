/**
 * app/(public)/join/page.tsx — Join EPMOC
 */

import type { Metadata } from "next";
import JoinForm from "@/components/public/JoinForm";

export const metadata: Metadata = {
  title: "Join Us | EPMOC",
  description: "Apply to join EPMOC — the Engineering Professionals & Management Organization Club at IIIT Una.",
};

export default function JoinPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container-section py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">Become a part of us</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Join EPMOC
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto text-lg">
            Fill in this form to express your interest. Our team will review your application
            and you can then sign in to your dashboard.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <JoinForm />
        </div>
      </div>
    </div>
  );
}
