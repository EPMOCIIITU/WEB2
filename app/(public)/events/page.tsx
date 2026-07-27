import { CalendarDays, MapPin, Tag } from "lucide-react";

export const metadata = {
  title: "Events | EPMOC",
  description: "Upcoming and past events organised by EPMOC at IIIT Una.",
};

const STATIC_EVENTS = [
  {
    id: 1,
    title: "Tech Symposium 2025",
    description: "A 48-hour hackathon bringing together the best minds to solve real-world problems. Includes workshops on Web3 and AI.",
    date: new Date("2025-04-15T10:00:00"),
    venue: "Main Auditorium, IIIT Una",
    category: "technical",
  },
  {
    id: 2,
    title: "Management Workshop Series",
    description: "Learn the fundamentals of product management and agile methodologies from industry experts.",
    date: new Date("2024-11-20T14:00:00"),
    venue: "Seminar Hall A",
    category: "workshop",
  },
  {
    id: 3,
    title: "Cultural Fest - Meraki",
    description: "Annual cultural festival featuring music, dance, and art competitions across departments.",
    date: new Date("2024-10-05T17:00:00"),
    venue: "Open Air Theatre",
    category: "cultural",
  },
];

export default function EventsPage() {
  const upcoming = STATIC_EVENTS.filter((e) => e.date >= new Date());
  const past = STATIC_EVENTS.filter((e) => e.date < new Date());

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="container-section py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Club Events
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            From technical hackathons to cultural fests — EPMOC organises diverse events throughout the year.
          </p>
        </div>

        {upcoming.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Upcoming Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} upcoming />
              ))}
            </div>
          </section>
        )}

        {past.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Past Events</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, upcoming = false }: { event: any; upcoming?: boolean }) {
  const dateStr = event.date.toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
  
  return (
    <div className="card p-6 flex flex-col gap-4">
      {upcoming && (
        <span className="inline-flex text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full w-fit">
          Upcoming
        </span>
      )}
      <div>
        <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 capitalize mb-3">
          <Tag className="w-3 h-3 mr-1" />
          {event.category}
        </span>
        <h3 className="font-bold text-slate-900 text-lg mb-2">{event.title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{event.description}</p>
      </div>
      <div className="space-y-2 text-sm text-slate-500 mt-auto pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          <span>{dateStr}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{event.venue}</span>
        </div>
      </div>
    </div>
  );
}
