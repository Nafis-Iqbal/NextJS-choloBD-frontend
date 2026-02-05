import React from "react";
import Link from "next/link";
import { SectionHeader } from "./SectionHeader";

type Hotel = { id: string; name: string; city: string; price: number; rating: number };

export const HotelDeals: React.FC<{ hotels: Hotel[] }> = ({ hotels }) => {
  return (
    <section className="w-full">
      <SectionHeader title="Hotel Deals" subtitle="Comfort stays at friendly prices" className="mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 font-sans">
        {hotels.map((h) => (
          <div key={h.id} className="rounded-xl bg-gray-800/70 border border-gray-700 p-4">
            <div className="h-24 rounded-lg bg-teal-700 mb-3" />
            <div className="text-white font-medium">{h.name}</div>
            <div className="text-gray-300 text-sm">{h.city}</div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-white">৳ {h.price.toLocaleString()}</span>
              <span className="text-yellow-400">{"★".repeat(Math.round(h.rating))}</span>
            </div>
            <Link href="/booking/hotel" className="mt-3 w-full rounded-lg bg-teal-600 hover:bg-teal-700 text-white py-2 text-sm block text-center">Book</Link>
          </div>
        ))}
      </div>
    </section>
  );
};
