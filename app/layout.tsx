/**
 * app/layout.tsx — Root Layout
 *
 * Wraps the entire application with:
 *   - ClerkProvider (makes auth context available everywhere)
 *   - Google Fonts (Inter + Plus Jakarta Sans for premium typography)
 *   - Light-mode body background (dashboard layout overrides to dark)
 */

import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

// Load fonts with CSS variable bindings for use in Tailwind
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "EPMOC — Event Planning, Management & Organising Council",
    template: "%s | EPMOC",
  },
  description:
    "The official management portal for EPMOC — connecting members, tracking contributions, and powering club operations.",
  keywords: ["college club", "student organization", "club management", "EPMOC"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "EPMOC",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // ClerkProvider must wrap the entire tree so auth state is always available
    <ClerkProvider afterSignOutUrl="/">
      <html
        lang="en"
        className={`${inter.variable} ${plusJakarta.variable}`}
        suppressHydrationWarning
      >
        <body className="bg-slate-50 text-slate-900 font-sans min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
