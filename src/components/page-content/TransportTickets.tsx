import React from "react";
import Link from "next/link";
import { SectionHeader } from "./SectionHeader";

type Ticket = { id: string; type: string; route: string; price: number };

export const TransportTickets: React.FC<{ tickets: Ticket[], className?: string }> = ({ tickets, className }) => {
  const getNavigationPath = (type: string): string => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("bus")) return "/booking/bus";
    if (lowerType.includes("railway") || lowerType.includes("train")) return "/booking/railway";
    if (lowerType.includes("flight") || lowerType.includes("air")) return "/booking/flight";
    return "/booking";
  };

  return (
    <section className={`w-full scroll-mt-36 ${className}`} id="transport">
      <SectionHeader title="Transport Tickets" subtitle="Pick a ride and go" className="mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
        {tickets.map((t) => (
          <Link key={t.id} href={getNavigationPath(t.type)} className="rounded-xl theme-card p-4 flex items-center justify-between hover:brightness-95 hover:outline hover:outline-[var(--theme-teal)] transition-colors cursor-pointer">
            <div>
              <div className="theme-text font-semibold">{t.type}</div>
              <div className="theme-text-muted text-sm">{t.route}</div>
            </div>
            <div className="theme-text font-medium">৳ {t.price.toLocaleString()}</div>
          </Link>
        ))}
      </div>
    </section>
  );
};
