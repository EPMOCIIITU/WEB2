import { Box, Triangle, Hexagon, Circle, Shield, Sparkles, Target, Zap } from "lucide-react";

export function SponsorsMarquee() {
  const sponsors = [
    { name: "Tech Mahindra", icon: Hexagon },
    { name: "TCS", icon: Shield },
    { name: "Infosys", icon: Target },
    { name: "Wipro", icon: Zap },
    { name: "Google", icon: Box },
    { name: "Microsoft", icon: Triangle },
    { name: "Amazon", icon: Circle },
    { name: "IBM", icon: Sparkles },
  ];

  return (
    <div className="w-full overflow-hidden bg-slate-900 py-10">
      <div className="text-center mb-8">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
          Supported by industry leaders
        </p>
      </div>

      <div className="relative flex w-full max-w-7xl mx-auto overflow-hidden">
        {/* Left/Right fading gradients for smooth entering/exiting */}
        <div className="absolute left-0 top-0 z-10 h-full w-20 bg-gradient-to-r from-slate-900 to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none"></div>

        <div className="flex whitespace-nowrap animate-marquee items-center">
          {/* First set of sponsors */}
          {sponsors.map((sponsor, idx) => (
            <div
              key={`s1-${idx}`}
              className="flex items-center justify-center px-12 gap-3 text-slate-400 opacity-60 hover:opacity-100 hover:text-white transition-all duration-300 cursor-default"
            >
              <sponsor.icon className="w-8 h-8" />
              <span className="text-2xl font-bold tracking-tight">{sponsor.name}</span>
            </div>
          ))}
          {/* Second set of sponsors for seamless looping */}
          {sponsors.map((sponsor, idx) => (
            <div
              key={`s2-${idx}`}
              className="flex items-center justify-center px-12 gap-3 text-slate-400 opacity-60 hover:opacity-100 hover:text-white transition-all duration-300 cursor-default"
            >
              <sponsor.icon className="w-8 h-8" />
              <span className="text-2xl font-bold tracking-tight">{sponsor.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
