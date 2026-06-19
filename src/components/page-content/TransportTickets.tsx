import Link from "next/link";
import React from "react";
import { SectionHeader } from "./SectionHeader";
import type { HomeMessages } from "@/i18n/homeMessages";

type Ticket = {
  id: string;
  type: string;
  route: string;
  price: number;
  time?: string;
  seats?: string;
  badge?: string;
};

export const TransportTickets: React.FC<{
  tickets: readonly Ticket[];
  className?: string;
  copy: HomeMessages["transportTickets"];
}> = ({ tickets, className, copy }) => {
  const getNavigationPath = (type: string): string => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("bus")) return "/booking/bus";
    if (lowerType.includes("railway") || lowerType.includes("train"))
      return "/booking/railway";
    if (lowerType.includes("flight") || lowerType.includes("air"))
      return "/booking/flight";
    if (lowerType.includes("launch")) return "/booking/railway";
    return "/booking";
  };

  const getBadgeTone = (badge?: string) => {
    switch (badge?.toLowerCase()) {
      case "best value":
      case "popular":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "new":
      case "limited":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
      default:
        return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300";
    }
  };

  return (
    <section className={`w-full scroll-mt-36 ${className}`} id="transport">
      <SectionHeader
        title={copy.title}
        subtitle={copy.subtitle}
        className="mb-6"
      />

      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-base font-medium text-slate-700">{copy.emptyTitle}</p>
          <p className="mt-1 text-sm text-slate-500">{copy.emptySubtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 font-sans">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={getNavigationPath(t.type)}
              className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--theme-teal)] hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="theme-text font-semibold">{t.type}</h3>
                    {t.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getBadgeTone(
                          t.badge,
                        )}`}
                      >
                        {t.badge}
                      </span>
                    )}
                  </div>
                  <p className="theme-text-muted mt-1 text-sm">{t.route}</p>
                </div>
                <div className="text-right">
                  <p className="theme-text text-sm font-medium">{copy.fromLabel}</p>
                  <p className="theme-text font-semibold">
                    ৳ {t.price.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {t.time && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">
                    {t.time}
                  </span>
                )}
                {t.seats && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">
                    {t.seats}
                  </span>
                )}
                <span className="rounded-full bg-teal-50 px-2.5 py-1 font-medium text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                  {copy.qrReady}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">{copy.bookNow}</span>
                <span className="text-sm font-semibold text-[var(--theme-teal)] transition group-hover:translate-x-1">
                  {copy.viewDetails} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {copy.focusText && (
        <div className="mt-12 flex justify-center md:mt-16">
          <div className="relative max-w-3xl px-6 py-8 md:py-10">
            <div className="absolute left-1/2 top-0 h-1 w-16 -translate-x-1/2 bg-gradient-to-r from-transparent via-[var(--theme-teal)] to-transparent" />
            <p className="font-sans theme-text text-center text-lg font-medium leading-relaxed md:text-xl">
              {copy.focusText}
            </p>
            <div className="absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 bg-gradient-to-r from-transparent via-[var(--theme-teal)] to-transparent" />
          </div>
        </div>
      )}
    </section>
  );
};
