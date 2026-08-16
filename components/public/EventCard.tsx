"use client";

import { useState } from "react";
import { CalendarDays, MapPin, Tag, X } from "lucide-react";

export function EventCard({ event, upcoming = false }: { event: any; upcoming?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  const dateStr = event.date.toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
  
  return (
    <>
      <div 
        className="card p-6 flex flex-col gap-4 cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1"
        onClick={() => setIsOpen(true)}
      >
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
          <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">{event.description}</p>
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

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
          <div 
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="mb-6">
              {upcoming && (
                <span className="inline-flex text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full w-fit mb-4">
                  Upcoming Event
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">{event.title}</h2>
              <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 capitalize">
                <Tag className="w-3 h-3 mr-1" />
                {event.category}
              </span>
            </div>
            
            <div className="prose prose-slate text-slate-600 mb-8">
              <p>{event.description}</p>
            </div>
            
            <div className="flex flex-col gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <CalendarDays className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date & Time</span>
                  <span className="font-medium">{dateStr}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</span>
                  <span className="font-medium">{event.venue}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
