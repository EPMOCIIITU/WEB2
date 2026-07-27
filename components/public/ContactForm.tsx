"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError(null);
    // Simulate send — wire to Resend/Nodemailer in production
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="card p-8">
      {sent ? (
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
          <p className="text-slate-600">We'll get back to you as soon as possible.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label" htmlFor="contact-name">
                Name <span className="text-rose-500">*</span>
              </label>
              <input id="contact-name" name="name" value={form.name} onChange={handleChange} className="input" placeholder="Your name" />
            </div>
            <div>
              <label className="label" htmlFor="contact-email">
                Email <span className="text-rose-500">*</span>
              </label>
              <input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} className="input" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="contact-subject">Subject</label>
            <input id="contact-subject" name="subject" value={form.subject} onChange={handleChange} className="input" placeholder="What is it about?" />
          </div>
          <div>
            <label className="label" htmlFor="contact-message">
              Message <span className="text-rose-500">*</span>
            </label>
            <textarea id="contact-message" name="message" value={form.message} onChange={handleChange} rows={5} className="textarea" placeholder="Tell us what you have in mind…" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
            ) : (
              <><Send className="w-4 h-4" /> Send Message</>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
