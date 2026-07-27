/**
 * app/(public)/contact/page.tsx — Contact Us
 */

import type { Metadata } from "next";
import ContactForm from "@/components/public/ContactForm";
import { Mail, MapPin, Phone, Instagram, Linkedin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | EPMOC",
  description: "Get in touch with the EPMOC team at IIIT Una.",
};

const CONTACT_INFO = [
  {
    icon: MapPin,
    label: "Address",
    value: "Indian Institute of Information Technology, Una\nHimachal Pradesh — 177209",
  },
  {
    icon: Mail,
    label: "Email",
    value: "epmoc@iiitu.ac.in",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 80855 09019",
  },
];

const SOCIAL = [
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/epmoc_iiitu/" },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
];

export default function ContactPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container-section py-16">
        {/* Hero */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-3">We'd love to hear from you</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Contact Us
          </h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            Have a question, partnership proposal, or just want to say hi? Drop us a message.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 max-w-5xl mx-auto">
          {/* Left — contact info */}
          <div className="space-y-6">
            {CONTACT_INFO.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-0.5">{label}</p>
                  <p className="text-sm text-slate-600 whitespace-pre-line">{value}</p>
                </div>
              </div>
            ))}

            <div>
              <p className="text-sm font-semibold text-slate-900 mb-3">Follow Us</p>
              <div className="flex gap-3">
                {SOCIAL.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all"
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right — contact form (client component) */}
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
