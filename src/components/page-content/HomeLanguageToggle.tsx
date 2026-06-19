"use client";

import { useRouter } from "next/navigation";

import { HOME_LOCALE_COOKIE } from "@/i18n/constants";
import type { SupportedHomeLocale } from "@/i18n/homeMessages";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const HomeLanguageToggle = ({
  locale,
  label,
  className,
}: {
  locale: SupportedHomeLocale;
  label: string;
  className?: string;
}) => {
  const router = useRouter();

  const setLocale = (nextLocale: SupportedHomeLocale) => {
    document.cookie = `${HOME_LOCALE_COOKIE}=${nextLocale}; path=/; max-age=${COOKIE_MAX_AGE}`;
    router.refresh();
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/40 p-1 text-xs font-semibold text-white backdrop-blur-md shadow-lg ${className ?? ""}`}
    >
      <span className="hidden px-2 text-[10px] uppercase tracking-[0.2em] text-white/60 md:inline">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`rounded-full px-3 py-1 transition ${
          locale === "en" ? "bg-white text-black" : "text-white/80 hover:text-white"
        }`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("bn")}
        className={`rounded-full px-3 py-1 transition ${
          locale === "bn" ? "bg-white text-black" : "text-white/80 hover:text-white"
        }`}
        aria-pressed={locale === "bn"}
      >
        বাংলা
      </button>
    </div>
  );
};
