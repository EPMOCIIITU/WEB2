import Link from "next/link";
import { EventsCarousel } from "@/components/public/EventsCarousel";
import { SponsorsMarquee } from "@/components/public/SponsorsMarquee";
import { connectDB } from "@/lib/db";
import Event from "@/models/Event";
import { formatDate } from "@/lib/utils";
import { Users, Award, Calendar, Star, ArrowRight } from "lucide-react";

const STATS = [
  { label: "Active Members", value: "120+", icon: Users },
  { label: "Events Organised", value: "48",  icon: Calendar },
  { label: "Departments",      value: "6",   icon: Award },
  { label: "Years Active",     value: "6",   icon: Star },
];

export default async function LandingPage() {
  let upcomingEvents: Awaited<ReturnType<typeof Event.find>> = [] as any;
  try {
    await connectDB();
    upcomingEvents = await Event.find({ isPublished: true, date: { $gte: new Date() } })
      .sort({ date: 1 })
      .limit(6)
      .lean();
  } catch (e) {
    // DB unavailable — fallback to static cards inside EventsCarousel
  }
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* ── Hero Section ────────────────────────────────────────────── */}
      <section 
        className="relative w-full py-28 sm:py-36 text-center bg-slate-900 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.85)), url('https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=2070&auto=format&fit=crop')"
        }}
      >
        <div className="container-section relative z-10">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Welcome to EPMOC
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Engineering Professionals & Management Organization Club — bridging the gap
            between technical knowledge and management excellence at IIIT Una.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-in" className="btn-primary px-8 py-3 bg-white text-slate-900 hover:bg-slate-100">
              Sign In to Portal <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
            <Link href="/about" className="btn-secondary px-8 py-3 bg-slate-800/50 text-white border border-slate-700 hover:bg-slate-700/50">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Row ────────────────────────────────────────────────── */}
      <section className="container-section py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-stagger">
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="card p-8 text-center flex flex-col items-center hover:shadow-md transition-shadow">
              <Icon className="w-7 h-7 text-indigo-500 mb-3" />
              <span className="text-4xl font-bold text-slate-900 mb-1">{value}</span>
              <span className="text-sm text-slate-500 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Events Carousel ─────────────────────────────────────────── */}
      <section className="container-section pb-24">
        <EventsCarousel
          events={upcomingEvents.map((e: any) => ({
            id: String(e._id),
            title: e.title,
            description: e.description,
            image: e.posterUrl || null,
            date: formatDate(e.date),
            venue: e.venue,
          }))}
        />
      </section>

      {/* ── Sponsors Marquee ─────────────────────────────────────────── */}
      <section className="pb-20">
        <SponsorsMarquee />
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="container-section">
        <div className="card p-12 text-center bg-slate-900 text-white border-0 overflow-hidden relative">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-slate-800/50 blur-3xl" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
              Sign in with your club credentials to access the member portal. Or reach out to us for any queries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-in" className="btn-primary bg-white text-slate-900 hover:bg-slate-100 px-8 py-3">
                Access the Portal
              </Link>
              <Link href="/contact" className="btn-secondary border-slate-700 bg-slate-800 text-white hover:bg-slate-700 px-8 py-3">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
