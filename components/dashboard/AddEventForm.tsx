"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Tag, FileText, Link2, Send, Loader2 } from "lucide-react";

const CATEGORIES = [
  { value: "technical", label: "Technical" },
  { value: "cultural", label: "Cultural" },
  { value: "management", label: "Management" },
  { value: "workshop", label: "Workshop" },
  { value: "seminar", label: "Seminar" },
  { value: "other", label: "Other" },
];

export default function AddEventForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    category: "other",
    registrationLink: "",
    isPublished: true,
  });
  const [posterFile, setPosterFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title || !form.description || !form.date || !form.venue || !form.category) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!posterFile) {
      setError("Please upload a poster image for the event.");
      return;
    }

    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("poster", posterFile as File);
        Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));

        const res = await fetch("/api/events", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to create event");
        setSuccess(true);
        setTimeout(() => router.push("/dashboard/events"), 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  if (success) {
    return (
      <div className="card p-12 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <Send className="w-6 h-6 text-emerald-600" />
        </div>
        <h3 className="font-display text-xl font-bold text-slate-900 mb-2">
          Event Created!
        </h3>
        <p className="text-slate-500 text-sm">Redirecting to events list…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="label" htmlFor="event-title">
          <FileText className="inline w-3.5 h-3.5 mr-1.5 text-slate-400" />
          Event Title <span className="text-rose-500">*</span>
        </label>
        <input
          id="event-title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g., Tech Symposium 2025"
          className="input"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="label" htmlFor="event-desc">
          Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="event-desc"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          placeholder="Describe the event, what to expect, who can attend…"
          className="textarea"
          required
        />
      </div>

      {/* Date & Venue */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="event-date">
            <CalendarDays className="inline w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Date & Time <span className="text-rose-500">*</span>
          </label>
          <input
            id="event-date"
            name="date"
            type="datetime-local"
            value={form.date}
            onChange={handleChange}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="event-venue">
            <MapPin className="inline w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Venue <span className="text-rose-500">*</span>
          </label>
          <input
            id="event-venue"
            name="venue"
            value={form.venue}
            onChange={handleChange}
            placeholder="e.g., Seminar Hall A, IIITU"
            className="input"
            required
          />
        </div>
      </div>

      {/* Category & Registration link */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label" htmlFor="event-category">
            <Tag className="inline w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            id="event-category"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="select"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="event-reg">
            <Link2 className="inline w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Registration Link
          </label>
          <input
            id="event-reg"
            name="registrationLink"
            type="url"
            value={form.registrationLink}
            onChange={handleChange}
            placeholder="https://forms.google.com/…"
            className="input"
          />
        </div>
      </div>

      {/* Poster upload (required) */}
      <div>
        <label className="label" htmlFor="event-poster">
          Poster Image <span className="text-rose-500">*</span>
        </label>
        <input
          id="event-poster"
          name="poster"
          type="file"
          accept="image/*"
          onChange={(e) => setPosterFile(e.target.files ? e.target.files[0] : null)}
          className="w-full"
          required
        />
      </div>

      {/* Publish toggle */}
      <div className="flex items-center gap-3">
        <input
          id="event-published"
          name="isPublished"
          type="checkbox"
          checked={form.isPublished}
          onChange={handleChange}
          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
        />
        <label htmlFor="event-published" className="text-sm font-medium text-slate-700 cursor-pointer">
          Publish immediately (visible on public events page)
        </label>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Create Event
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
