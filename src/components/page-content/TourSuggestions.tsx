import React from "react";
import Link from "next/link";
import { SectionHeader } from "./SectionHeader";

type Tour = { id: string; name: string; place: string; days: number; price: number; rating: number };

export const TourSuggestions: React.FC<{ tours: Tour[]; className?: string; focusText?: string }> = ({ tours, className, focusText }) => {
  return (
    <section className={`w-full theme-section rounded-xl p-6 md:p-8 scroll-mt-36 ${className}`} id="tours">
      <SectionHeader 
        title="Curated Cash-Free Adventures" 
        subtitle="From weekend getaways to multi-day tours — everything booked and paid with QR" 
        className="mb-6" 
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
        {tours.map((t) => (
          <TourSuggestionsCard key={t.id} tour={t} />
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

      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <SectionHeader
          title="Build Your Own Tour"
          subtitle="Pick places, set dates, add hotels and transport — your plan, your style"
          className="mb-4"
        />

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 font-sans">
          <Link
            className="px-5 py-2 rounded-md font-semibold hover:scale-110 theme-btn-teal"
            href="/tour-builder"
          >
            Start Building
          </Link>

          <Link 
            className="px-5 py-2 rounded-md font-semibold hover:scale-110 theme-btn-teal"
            href="tour-builder/tours"
          >
            Explore Ideas
          </Link>
        </div>
      </div>
    </section>
  );
};

const TourSuggestionsCard = ({tour} : {tour: Tour}) => {
  return (
    <div className="rounded-xl overflow-hidden theme-card">
      <div className="h-32 md:h-40 theme-placeholder" />
      <div className="flex flex-col p-4 md:p-5">

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold theme-text">{tour.name}</h3>
          <span className="text-xs px-2 py-1 rounded theme-section theme-text-muted">{tour.days} days</span>
        </div>

        <p className="text-sm theme-text-muted mt-1">{tour.place}</p>
        <div className="mt-1 text-xs font-medium text-teal-600 dark:text-teal-400">
          ✓ Cashless Experience Included
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="theme-text font-medium">৳ {tour.price.toLocaleString()}</span>
          <span className="theme-star">{"★".repeat(Math.round(tour.rating))}</span>
        </div>

        <Link 
          className="px-2 py-1 mt-4 w-fit rounded-lg text-sm theme-btn-teal"
          href={`tour-builder/tours/${tour.id}`}
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
