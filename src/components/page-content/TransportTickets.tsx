import React from "react";
import Link from "next/link";
import { SectionHeader } from "./SectionHeader";

type Ticket = { id: string; type: string; route: string; price: number };

export const TransportTickets: React.FC<{ tickets: Ticket[] }> = ({ tickets }) => {
  const getNavigationPath = (type: string): string => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes("bus")) return "/booking/bus";
    if (lowerType.includes("railway") || lowerType.includes("train")) return "/booking/railway";
    if (lowerType.includes("flight") || lowerType.includes("air")) return "/booking/air-ways";
    return "/booking";
  };

  return (
    <section className="w-full">
      <SectionHeader title="Transport Tickets" subtitle="Pick a ride and go" className="mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
        {tickets.map((t) => (
          <Link key={t.id} href={getNavigationPath(t.type)} className="rounded-xl bg-gray-800/70 border border-gray-700 p-4 flex items-center justify-between hover:bg-gray-800 hover:border-teal-600 transition-colors cursor-pointer">
            <div>
              <div className="text-white font-semibold">{t.type}</div>
              <div className="text-gray-300 text-sm">{t.route}</div>
            </div>
            <div className="text-white font-medium">৳ {t.price.toLocaleString()}</div>
          </Link>
        ))}
      </div>
    </section>
  );
};
