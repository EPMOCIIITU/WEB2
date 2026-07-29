/**
 * app/(public)/sign-in/[[...sign-in]]/page.tsx — Clerk Sign-In Page
 *
 * The `[[...sign-in]]` catch-all route is REQUIRED by Clerk so that
 * the hosted sign-in component can handle its own internal sub-routes
 * (e.g. factor verification, MFA, OAuth callbacks).
 *
 * The <SignIn> component is pre-styled by Clerk but we override the
 * appearance to match our dark design system via the `appearance` prop.
 */

import { SignIn } from "@clerk/nextjs";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Sign In",
  description: "Sign in to the EPMOC member portal.",
};

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 mesh-bg">
      {/* Brand header above the Clerk component */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16
                        rounded-2xl bg-brand-500/20 border border-brand-500/30
                        mb-4 animate-glow">
          <Shield className="w-8 h-8 text-brand-400" />
        </div>
        <h1 className="font-display text-3xl font-bold gradient-text">
          Welcome Back
        </h1>
        <p className="text-gray-400 mt-2 text-sm">
          Sign in to access the EPMOC member portal
        </p>
      </div>

      {/* Clerk Sign-In Component */}
      <SignIn
        forceRedirectUrl="/dashboard"
        appearance={{
          variables: {
            colorPrimary:    "#6366f1",
            colorBackground: "#16163a",
            colorText:       "#ffffff",
            colorTextSecondary: "#9ca3af",
            colorInputBackground: "#0f0f23",
            colorInputText:  "#ffffff",
            borderRadius:    "0.75rem",
            fontFamily:      "Inter, system-ui, sans-serif",
          },
          elements: {
            card:               "glass-card shadow-brand-lg border-brand-500/20",
            headerTitle:        "hidden", // We use our own header above
            headerSubtitle:     "hidden",
            socialButtonsBlockButton:
              "border border-surface-border hover:border-brand-500/40 transition-colors",
            formButtonPrimary:
              "bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600",
            footerAction:       "text-gray-500",
            footerActionLink:   "text-brand-400 hover:text-brand-300",
          },
        }}
      />
    </div>
  );
}
