/**
 * app/(dashboard)/dashboard/events/page.tsx — Events List
 */

import { requirePermission } from "@/lib/rbac";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import Link from "next/link";
import { CalendarDays, CalendarPlus, MapPin, Tag, Trash2, ExternalLink, Globe, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import DeleteEventButton from "@/components/dashboard/DeleteEventButton";

export const metadata: Metadata = { title: "Events" };

const CATEGORY_COLORS: Record<string, string> = {
  technical:  "bg-indigo-100 text-indigo-700",
  cultural:   "bg-pink-100 text-pink-700",
  management: "bg-amber-100 text-amber-700",
  workshop:   "bg-emerald-100 text-emerald-700",
  seminar:    "bg-violet-100 text-violet-700",
  other:      "bg-slate-100 text-slate-700",
};

async function getEvents() {
  await connectDB();
  return Event.find({}).sort({ date: -1 }).lean();
}

export default async function EventsPage() {
  await requirePermission("edit_member");

  let events: Awaited<ReturnType<typeof getEvents>> = [];
  try {
    events = await getEvents();
  } catch {
    // DB offline
  }

  const upcoming = events.filter((e) => new Date(e.date) >= new Date());
  const past = events.filter((e) => new Date(e.date) < new Date());

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">Events</h1>
            <p className="text-slate-500 text-sm">
              {events.length} event{events.length !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>
        <Link href="/dashboard/events/new" className="btn-primary">
          <CalendarPlus className="w-4 h-4" />
          Add Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="card p-16 text-center">
          <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-600">No events yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-6">
            Create your first event to get started.
          </p>
          <Link href="/dashboard/events/new" className="btn-primary">
            <CalendarPlus className="w-4 h-4" /> Create Event
          </Link>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider mb-3">
                Upcoming ({upcoming.length})
              </h2>
              <div className="space-y-3">
                {upcoming.map((event) => (
                  <EventRow key={String(event._id)} event={event} />
                ))}
              </div>
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wider mb-3">
                Past Events ({past.length})
              </h2>
              <div className="space-y-3">
                {past.map((event) => (
                  <EventRow key={String(event._id)} event={event} past />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function EventRow({
  event,
  past = false,
}: {
  event: Awaited<ReturnType<typeof getEvents>>[number];
  past?: boolean;
}) {
  const d = new Date(event.date);
  const dateStr = d.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const timeStr = d.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "card px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4",
        past && "opacity-60"
      )}
    >
      {/* Date block */}
      <div className="flex-shrink-0 w-16 text-center bg-slate-50 rounded-xl py-2 border border-slate-200">
        <p className="text-xs text-slate-400 font-medium">
          {d.toLocaleDateString("en-IN", { month: "short" })}
        </p>
        <p className="text-2xl font-bold text-slate-900 leading-none">
          {d.getDate()}
        </p>
        <p className="text-xs text-slate-400">{d.getFullYear()}</p>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h3 className="font-semibold text-slate-900 truncate">{event.title}</h3>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", CATEGORY_COLORS[event.category])}>
            {event.category}
          </span>
          {event.isPublished ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium flex items-center gap-1">
              <Globe className="w-3 h-3" /> Public
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium flex items-center gap-1">
              <EyeOff className="w-3 h-3" /> Draft
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 truncate">{event.description}</p>
        <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> {dateStr} at {timeStr}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {event.venue}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {event.registrationLink && (
          <a
            href={event.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            title="Registration link"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <DeleteEventButton id={String(event._id)} />
      </div>
    </div>
  );
}
