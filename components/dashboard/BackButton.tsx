"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
}

export function BackButton({ fallbackHref = "/dashboard", label = "Back" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}