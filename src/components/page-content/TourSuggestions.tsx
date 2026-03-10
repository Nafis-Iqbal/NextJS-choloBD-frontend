import React from "react";
import Link from "next/link";
import { SectionHeader } from "./SectionHeader";

type Tour = { id: string; name: string; place: string; days: number; price: number; rating: number };

export const TourSuggestions: React.FC<{ tours: Tour[] }> = ({ tours }) => {
  return (
    <section className="w-full bg-section p-6 md:p-8 rounded-xl">
      <SectionHeader title="Suggested Tours" subtitle="Handpicked trips for quick getaways and longer escapes" className="mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
        {tours.map((t) => (
          <TourSuggestionsCard key={t.id} tour={t} />
        ))}
      </div>
    </section>
  );
};

const TourSuggestionsCard = ({tour} : {tour: Tour}) => {
  return (
    <div className="rounded-xl overflow-hidden bg-gray-800/70 border border-gray-700">
      <div className="h-32 md:h-40 bg-indigo-700" />
      <div className="flex flex-col p-4 md:p-5">

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{tour.name}</h3>
          <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-200">{tour.days} days</span>
        </div>

        <p className="text-sm text-gray-300 mt-1">{tour.place}</p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-white font-medium">৳ {tour.price.toLocaleString()}</span>
          <span className="text-yellow-400">{"★".repeat(Math.round(tour.rating))}</span>
        </div>

        <Link 
          className="px-2 py-1 mt-4 w-fit rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
          href={`tour-builder/tours/${tour.id}`}
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
