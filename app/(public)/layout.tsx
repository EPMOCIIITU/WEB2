/**
 * app/(public)/layout.tsx — Public Route Group Layout
 *
 * Wraps all public pages (/, /sign-in, /sign-up) with the PublicNavbar.
 * Route groups with parentheses (public) do NOT affect the URL path.
 */

import { PublicNavbar } from "@/components/public/PublicNavbar";
import Link from "next/link";
import { Twitter, Instagram, Linkedin, Github, Mail } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-1">{children}</main>

      {/* Modern Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 border-t border-slate-800">
        <div className="container-section">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-8 mb-12">

            {/* Brand Section */}
            <div className="md:col-span-1">
              <Link href="/" className="inline-block mb-4">
                <img src="/epmoc-logo.png" alt="EPMOC Logo" className="h-16 w-auto invert opacity-90" />
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
                Event Planning, Management & Organising Council — bridging the gap between technical knowledge and management excellence at IIIT Una.
              </p>
              <div className="flex items-center gap-4">
                   <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all text-slate-400">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="https://www.instagram.com/epmoc_iiitu/" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all text-slate-400">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://www.linkedin.com/company/epmoc-iiitu/" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all text-slate-400">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="https://github.com/EPMOCIIITU" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700 hover:text-white transition-all text-slate-400">
                  <Github className="w-4 h-4" />
                </a>
                  
        
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/events" className="hover:text-white transition-colors">Events</Link></li>
                <li><Link href="/team" className="hover:text-white transition-colors">Our Team</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-6">Get in Touch</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-500" />
                  <a href="mailto:epmoc@iiitu.ac.in" className="hover:text-white transition-colors">epmoc@iiitu.ac.in</a>
                </li>
                <li>
                  <p className="text-slate-400">
                    Indian Institute of Information Technology Una,
                    <br />
                    Saloh, Una, Himachal Pradesh 177209
                  </p>
                </li>
                <li>
                  <Link href="/contact" className="inline-block mt-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                    Send us a message &rarr;
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
            <p>
              © {new Date().getFullYear()} <span className="font-semibold text-slate-300">EPMOC</span>. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
