import React from "react";
import Link from "next/link";
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

  return (
    <section className={`w-full scroll-mt-36 ${className}`} id="transport">
      <SectionHeader 
        title="Travel Smoothly Across Bangladesh" 
        subtitle="Book buses, trains, launches & CNGs — Get QR tickets instantly. Board without cash stress." 
        className="mb-6" 
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
        {tickets.map((t) => (
          <Link key={t.id} href={getNavigationPath(t.type)} className="rounded-xl theme-card p-4 flex items-center justify-between hover:brightness-95 hover:outline hover:outline-[var(--theme-teal)] transition-colors cursor-pointer">
            <div>
              <div className="theme-text font-semibold">{t.type}</div>
              <div className="theme-text-muted text-sm">{t.route}</div>
              <div className="mt-1 text-xs font-medium text-teal-600 dark:text-teal-400">QR Ready</div>
            </div>
            <div className="theme-text font-medium">৳ {t.price.toLocaleString()}</div>
          </Link>
        ))}
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
