/**
 * components/public/PublicNavbar.tsx — Public Navbar
 *
 * Layout (desktop):
 *   [ Logo ]  [ Login / Register ]  ·  [ Nav Links ... ]  ·  [ Join Us CTA ]
 *
 * Layout (mobile):
 *   [ Logo ] ················· [ Hamburger ]
 *   └─ Dropdown: all links + Login + Join Us
 *
 * Design: Clean neutral palette — no bright colours, muted hover states,
 *         white background with a subtle bottom border.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { Menu, X, LogIn, ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Nav link config ───────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home",             href: "/"         },
  { label: "Upcoming Events",  href: "/events"   },
  { label: "About Us",         href: "/about"    },
  { label: "Our Team",         href: "/team"     },
  { label: "Contact Us",       href: "/contact"  },
  { label: "Join Us",          href: "/join"     },
];

const CTA_LINK = {
  label: "Join Us",
  href: "/join",
};

// ── Component ─────────────────────────────────────────────────────────────
export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const pathname  = usePathname();
  const { isSignedIn, isLoaded } = useUser();

  // Add a tiny drop-shadow when user scrolls down
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full bg-white transition-shadow duration-200",
        scrolled ? "shadow-sm border-b border-accent-200" : "border-b border-accent-200"
      )}
    >
      <div className="container-section">
        <nav className="flex items-center h-16 gap-4">

          {/* ── 1. Logo ────────────────────────────────────────────────── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0 group"
            aria-label="EPMOC Home"
          >
            <img src="/epmoc-logo.png" alt="EPMOC Logo" className="h-10 w-auto transition-opacity group-hover:opacity-80" />
          </Link>

          {/* ── 3. Navigation Links (center / fill) ─────────────────────── */}
          <ul className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn("pub-nav-link", isActive && "active")}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ── 4. Login / Register CTA (far right) ──────────────────── */}
          <div className="hidden md:flex flex-shrink-0">
            {!isLoaded ? (
              <div className="w-32 h-9 rounded-lg bg-accent-100 animate-pulse" />
            ) : isSignedIn ? (
              <div className="flex items-center gap-2.5">
                <Link href="/dashboard" className="btn-primary py-2 px-4 text-sm">
                  Portal <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8 ring-1 ring-accent-200 rounded-lg",
                    },
                  }}
                />
              </div>
            ) : (
              <Link href="/sign-in" className="btn-primary py-2 px-4 text-sm">
                <LogIn className="w-4 h-4" />
                Login / Register
              </Link>
            )}
          </div>

          {/* ── 5. Mobile Hamburger ─────────────────────────────────────── */}
          <div className="flex md:hidden items-center gap-2 ml-auto">
            {/* Show sign-in icon on mobile even before menu opens */}
            {isLoaded && isSignedIn && <UserButton />}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-accent-600 hover:bg-accent-100
                         transition-colors duration-150"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen
                ? <X    className="w-5 h-5" />
                : <Menu className="w-5 h-5" />
              }
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile Dropdown ────────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="md:hidden bg-white border-t border-accent-200
                     animate-slide-down"
        >
          <div className="container-section py-3 space-y-0.5">
            {/* Nav links */}
            {NAV_LINKS.map(({ label, href }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium",
                    "text-accent-700 hover:text-accent-900 hover:bg-accent-50",
                    "transition-colors duration-150",
                    isActive && "text-accent-900 bg-accent-100 font-semibold"
                  )}
                >
                  {label}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="my-2 border-t border-accent-200" />

            {/* Auth + Join Us */}
            <div className="flex flex-col gap-2 pt-1 pb-2">
              {!isLoaded ? (
                <div className="h-10 rounded-lg bg-accent-100 animate-pulse" />
              ) : isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="btn-secondary w-full justify-center"
                >
                  Go to Portal <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/sign-in"
                  className="flex items-center justify-center gap-2 px-4 py-2.5
                             rounded-lg border border-accent-300 text-sm font-medium
                             text-accent-800 hover:bg-accent-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login / Register
                </Link>
              )}
              <Link href={CTA_LINK.href} className="btn-primary w-full justify-center">
                {CTA_LINK.label}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
