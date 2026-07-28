import React from "react";
import Link from "next/link";
import { ArrowRight, Bus, Plane, Ship, Ticket as TicketIcon, TrainFront } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

type Ticket = { id: string; type: string; route: string; price: number };

export const TransportTickets: React.FC<{ tickets: Ticket[], className?: string; focusText?: string }> = ({ tickets, className, focusText }) => {
  const getNavigationPath = (type: string): string => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("bus")) return "/booking/bus";
    if (lowerType.includes("railway") || lowerType.includes("train")) return "/booking/railway";
    if (lowerType.includes("flight") || lowerType.includes("air")) return "/booking/flight";
    return "/booking";
  };

  const getTransportIcon = (type: string): React.ElementType => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("bus")) return Bus;
    if (lowerType.includes("railway") || lowerType.includes("train")) return TrainFront;
    if (lowerType.includes("flight") || lowerType.includes("air")) return Plane;
    if (lowerType.includes("launch") || lowerType.includes("ferry")) return Ship;
    return TicketIcon;
  };

  return (
    <section className={`w-full scroll-mt-36 ${className}`} id="transport">
      <div className="mb-8 flex w-full flex-col items-center md:mb-10">
        <div className="mb-4 flex items-center gap-3 font-sans">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--theme-teal)]" />
          <span className="theme-text-teal text-[11px] font-semibold uppercase tracking-[0.22em]">Getting Around</span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--theme-teal)]" />
        </div>
        <SectionHeader
          title="Travel Smoothly Across Bangladesh"
          subtitle="Book buses, trains, launches & CNGs — Get QR tickets instantly. Board without cash stress."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 font-sans md:grid-cols-2 md:gap-6">
        {tickets.map((t) => {
          const Icon = getTransportIcon(t.type);
          const [origin, destination] = t.route.split("→").map((part) => part.trim());

          return (
            <Link
              key={t.id}
              href={getNavigationPath(t.type)}
              className="group flex flex-col gap-4 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-bg)] p-5 shadow-[0_12px_30px_-22px_var(--theme-deep-green)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--theme-teal)] hover:shadow-[0_24px_45px_-24px_var(--theme-deep-green)] md:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl theme-section transition-colors group-hover:bg-[var(--theme-teal)]">
                    <Icon className="h-5 w-5 theme-text-teal transition-colors group-hover:text-white" strokeWidth={1.75} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="theme-text truncate text-base font-semibold tracking-tight">{t.type}</span>
                    <span className="theme-text-subtle text-[10px] font-semibold uppercase tracking-[0.16em]">Instant QR ticket</span>
                  </span>
                </div>

                <div className="flex flex-shrink-0 flex-col items-end">
                  <span className="theme-text-subtle text-[10px] font-semibold uppercase tracking-[0.16em]">From</span>
                  <span className="theme-text text-lg font-semibold leading-tight">৳ {t.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="h-px w-full bg-[var(--theme-border-subtle)]" />

              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="theme-text truncate text-sm font-medium">{origin}</span>
                  <span className="flex min-w-[28px] flex-1 items-center gap-1">
                    <span className="h-px flex-1 bg-[var(--theme-border-subtle)]" />
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full theme-placeholder" />
                    <span className="h-px flex-1 bg-[var(--theme-border-subtle)]" />
                  </span>
                  <span className="theme-text truncate text-sm font-medium">{destination ?? t.route}</span>
                </div>

                <span className="flex flex-shrink-0 items-center gap-1.5 theme-text-teal text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Book
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={2.25} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {focusText && (
        <div className="mt-12 md:mt-16 flex justify-center">
          <div className="max-w-3xl px-6 py-8 md:py-10 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-[var(--theme-teal)] to-transparent" />
            <p className="font-sans theme-text text-lg md:text-xl font-medium leading-relaxed text-center">{focusText}</p>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-[var(--theme-teal)] to-transparent" />
          </div>
        </div>
      )}
    </section>
  );
};
