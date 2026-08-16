import { EventCard } from "@/components/public/EventCard";

export const metadata = {
  title: "Events | EPMOC",
  description: "Upcoming and past events organised by EPMOC at IIIT Una.",
};

const STATIC_EVENTS = [
  {
    id: 1,
    title: "Independance Day",
    description: "A ceremonial gathering to mark Independence Day, centered around the official flag hoisting protocol.",
    date: new Date("2026-08-15T10:00:00"),
    venue: "Flag Post, IIIT Una",
    category: "cultural",
  },
  {
    id: 2,
    title: "Orientation Week",
    description: "Learn the fundamentals of product management and agile methodologies from industry experts.",
    date: new Date("2026-08-31T14:00:00"),
    venue: "Room No. 227/228, Academic Block",
    category: "Orientation",
  },
  {
    id: 3,
    title: "Teachers' Day",
    description: "A dedicated event to honor the faculty, featuring cultural performances and formal expressions of gratitude from the student body.",
    date: new Date("2026-09-05T17:00:00"),
    venue: "Room No. 227/228, Academic Block",
    category: "cultural",
  },
  {
    id: 4,
    title: "Ganesh Chaturthi",
    description: "A cultural and religious observance celebrating Ganesh Chaturthi, featuring traditional rituals, daily prayers, and community gatherings among students.",
    date: new Date("2026-09-14T17:00:00"),
    venue: "Common Room, Iravati Hostel",
    category: "cultural",
  },
  {
    id: 5,
    title: "Institute Day",
    description: "A formal gathering to commemorate Institute Day, featuring the annual prize distribution and addresses by the Director and a designated Chief Guest.",
    date: new Date("2026-10-03T17:00:00"),
    venue: "Room No. 227/228, Academic Block",
    category: "Annual Event",
  },
  {
    id: 6,
    title: "MRIDANG - Cultural Fest",
    description: "Annual cultural festival featuring music, dance, and art competitions across departments. A night to remember!",
    date: new Date("2026-11-01T17:00:00"),
    venue: "Open Air Theatre",
    category: "Cultural",
  },
  {
    id: 7,
    title: "Garba Night",
    description: "Experience the vibrant energy of Navratri with a traditional Garba night! Put on your dancing shoes and join us for an evening filled with rhythm, music, and festive cheer.",
    date: new Date("2026-10-19T17:00:00"),
    venue: "Open Air Theatre",
    category: "Cultural",
  },
  {
    id: 8,
    title: "Republic Day",
    description: "A ceremonial gathering to mark Republic Day, centered around the official flag hoisting protocol.",
    date: new Date("2027-01-26T17:00:00"),
    venue: "Flag Post, IIIT Una",
    category: "Cultural",
  },
  {
    id: 9,
    title: "Awaz-e-Janata",
    description: "An interactive democratic simulation for first-year students. Participants form independent political parties, campaign through poster designs and peer outreach, and compete in a formal election process to determine a winning representative body.",
    date: new Date("2027-02-20T17:00:00"),
    venue: "Common Room, Iravati Hostel",
    category: "Political",
  },
  {
    id: 10,
    title: "Maha Shivratri Pooja",
    description: "A cultural and religious observance celebrating Maha Shivratri, featuring traditional rituals, prayers, and community gatherings.",
    date: new Date("2027-03-07T17:00:00"),
    venue: "Admin Block",
    category: "Cultural",
  },
  {
    id: 11,
    title: "Holi",
    description: "A vibrant celebration of colors and joy, welcoming the arrival of spring with music, dance, and festive enthusiasm.",
    date: new Date("2027-03-20T17:00:00"),
    venue: "Open Air Theatre",
    category: "Cultural",
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
            From Institue events to Cultural fests — EPMOC organises diverse events throughout the year.
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