"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CalendarDays, MapPin } from "lucide-react";
import Image from "next/image";

const EVENTS = [
  {
    id: 1,
    title: "Tech Symposium 2025",
    description: "A 48-hour hackathon bringing together the best minds to solve real-world problems. Includes workshops on Web3 and AI.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
    date: "15 Apr 2025",
    venue: "Main Auditorium",
  },
  {
    id: 2,
    title: "Management Workshop Series",
    description: "Learn the fundamentals of product management and agile methodologies from industry experts and guest speakers.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
    date: "20 Nov 2024",
    venue: "Seminar Hall A",
  },
  {
    id: 3,
    title: "Cultural Fest - Meraki",
    description: "Annual cultural festival featuring music, dance, and art competitions across departments. A night to remember!",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070&auto=format&fit=crop",
    date: "05 Oct 2024",
    venue: "Open Air Theatre",
  },
  {
    id: 4,
    title: "Alumni Meet 2024",
    description: "Connecting past and present students for networking, mentoring, and celebrating the legacy of EPMOC.",
    image: "https://images.unsplash.com/photo-1515169067868-5387ec356754?q=80&w=2070&auto=format&fit=crop",
    date: "12 Sep 2024",
    venue: "IIIT Una Campus",
  },
  {
    id: 5,
    title: "Design Thinking Bootcamp",
    description: "An intensive 2-day bootcamp focused on UI/UX principles, user research, and wireframing for aspiring designers.",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=2070&auto=format&fit=crop",
    date: "28 Aug 2024",
    venue: "Design Lab",
  },
];

export function EventsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalCards = EVENTS.length;

  const slides = useMemo(
    () =>
      EVENTS.map((event, index) => ({
        ...event,
        offset: (index - activeIndex + totalCards) % totalCards,
      })),
    [activeIndex, totalCards]
  );

  const scrollLeft = () => {
    const slider = document.getElementById("events-slider");
    if (slider) slider.scrollBy({ left: -320, behavior: "smooth" });
  };
  const scrollRight = () => {
    const slider = document.getElementById("events-slider");
    if (slider) slider.scrollBy({ left: 320, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-stretch">
      <div className="card p-7 sm:p-8 bg-slate-900 border-slate-800 text-left lg:w-1/3 lg:flex-shrink-0 flex flex-col justify-center">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Events Showcase
        </p>
        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Discover our latest events & activities
        </h3>
        <p className="text-slate-400 leading-relaxed max-w-xl">
          Swipe through to see what we've been up to. From technical hackathons to cultural 
          fests, EPMOC organises diverse events throughout the year.
        </p>

        <div className="mt-8 flex items-center gap-3 hidden lg:flex">
          <button
            type="button"
            onClick={scrollLeft}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-white transition-all hover:bg-slate-700"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-900 transition-all hover:bg-white"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Event Cards Area */}
      <div 
        id="events-slider"
        className="flex-1 flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 hide-scrollbar items-stretch"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {EVENTS.map((card) => (
          <div
            key={card.id}
            className="snap-start flex-none w-[85vw] sm:w-[320px] rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden"
          >
            {/* Image Section */}
            <div className="relative h-48 w-full bg-slate-100 flex-shrink-0">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 320px"
              />
            </div>

            {/* Text Section */}
            <div className="p-6 flex flex-col flex-grow">
              <h4 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                {card.title}
              </h4>
              <p className="text-sm text-slate-600 line-clamp-3 mb-6 flex-grow">
                {card.description}
              </p>
              
              <div className="mt-auto flex items-center justify-between text-xs font-medium text-slate-500 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-slate-400" />
                  {card.date}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="truncate max-w-[120px]">{card.venue}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
