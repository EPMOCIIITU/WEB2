import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // ── Neutral / Clean Palette ───────────────────────────────
      colors: {
        // Primary neutral accent — deep charcoal
        accent: {
          50:  "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          950: "#09090b",
        },
        // Brand tokens — indigo/violet used on landing page + dashboard dark sections
        brand: {
          DEFAULT: "#6366f1",
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        // Surface tokens — light mode first, dark mode via .dark prefix
        surface: {
          DEFAULT:     "#ffffff",
          subtle:      "#fafafa",
          muted:       "#f4f4f5",
          border:      "#e4e4e7",
          card:        "#ffffff",
          dark:        "#18181b",
          "dark-card":   "#1e1e24",
          "dark-border": "#2d2d35",
        },
      },
      // ── Typography ────────────────────────────────────────────
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      // ── Animations ────────────────────────────────────────────
      keyframes: {
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%":   { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "slide-down": {
          "0%":   { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-right": {
          "0%":   { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 20px 0px rgba(99,102,241,0.15)" },
          "50%":       { boxShadow: "0 0 40px 8px rgba(99,102,241,0.25)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%":       { opacity: "0.5" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "spin-slow": {
          "0%":   { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "fade-in":    "fade-in 0.4s ease-out forwards",
        "slide-in":   "slide-in 0.35s ease-out forwards",
        "slide-down": "slide-down 0.25s ease-out forwards",
        "slide-right":"slide-right 0.3s ease-out forwards",
        glow:         "glow 3s ease-in-out infinite",
        pulse:        "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
        shimmer:      "shimmer 2s linear infinite",
        "spin-slow":  "spin-slow 8s linear infinite",
        marquee:      "marquee 25s linear infinite",
      },
      // ── Border Radius ─────────────────────────────────────────
      borderRadius: {
        xl:   "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      // ── Box Shadows ───────────────────────────────────────────
      boxShadow: {
        "xs":    "0 1px 2px rgba(0,0,0,0.05)",
        "sm":    "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
        "md":    "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)",
        "lg":    "0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -4px rgba(0,0,0,0.04)",
        "nav":   "0 1px 0 0 #e4e4e7",
        "brand": "0 4px 24px rgba(99,102,241,0.25)",
        "glow":  "0 0 40px rgba(99,102,241,0.3)",
      },
      backgroundImage: {
        "mesh-gradient":
          "radial-gradient(at 40% 20%, rgba(99,102,241,0.08) 0px, transparent 50%), " +
          "radial-gradient(at 80% 0%, rgba(139,92,246,0.07) 0px, transparent 50%), " +
          "radial-gradient(at 0% 50%, rgba(99,102,241,0.05) 0px, transparent 50%)",
        "gradient-brand": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
