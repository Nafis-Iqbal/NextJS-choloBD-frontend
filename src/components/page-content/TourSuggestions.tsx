"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, MapPin, QrCode, Route, Star } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { useAutoScrollMarquee } from "./useAutoScrollMarquee";
import { CardImageWithFallback } from "./CardImageWithFallback";
import { TOUR_CARD_FALLBACK_IMAGE } from "./pageContentFallbackImages";

type Tour = { id: string; name: string; place: string; days: number; price: number; rating: number };

interface TourSuggestionsProps {
  tours: Tour[];
  animationSpeed?: number;
  cardWidth?: number;
  className?: string;
  focusText?: string;
  showFocusText?: boolean;
}

// The marquee wrap distance is derived from card width + gap, so both must stay in sync.
const CARD_GAP = 24;

const SECTION_SUBTITLE = "From weekend getaways to multi-day tours — everything booked and paid with QR";

export const TourSuggestions: React.FC<TourSuggestionsProps> = ({
  tours,
  animationSpeed = 25,
  cardWidth = 300,
  className = "",
  focusText,
  showFocusText = false,
}) => {
  const { x, handleScrollLeft, handleScrollRight } = useAutoScrollMarquee(
    tours.length,
    cardWidth,
    animationSpeed,
    CARD_GAP
  );

  return (
    <section className={`w-full scroll-mt-36 ${className}`} id="tours">
      <TourSuggestionsHeading />

      {tours.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-bg)] px-6 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full theme-section">
            <Route className="h-5 w-5 theme-text-teal" strokeWidth={1.75} />
          </span>
          <p className="theme-text text-base font-semibold">No tour packages to show right now</p>
          <p className="theme-text-muted text-sm">New curated tours are added regularly — or build your own below.</p>
        </div>
      ) : (
        <>
          <div className="relative w-full">
            <button
              onClick={handleScrollLeft}
              className="group absolute left-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--theme-border-subtle)] bg-[var(--theme-bg)] shadow-[0_10px_28px_-14px_var(--theme-deep-green)] transition-colors hover:bg-[var(--theme-teal)] md:left-2"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5 theme-text-teal transition-colors group-hover:text-white" strokeWidth={2.25} />
            </button>

            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-[var(--theme-bg)] to-transparent md:w-10"
            />

            <div className="w-full overflow-hidden py-4">
              <motion.div className="flex font-sans" style={{ x, gap: CARD_GAP }}>
                {[...tours, ...tours, ...tours].map((tour, index) => (
                  <TourSuggestionsCard key={`${tour.id}-${index}`} tour={tour} width={cardWidth} />
                ))}
              </motion.div>
            </div>

            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-[var(--theme-bg)] to-transparent md:w-10"
            />

            <button
              onClick={handleScrollRight}
              className="group absolute right-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--theme-border-subtle)] bg-[var(--theme-bg)] shadow-[0_10px_28px_-14px_var(--theme-deep-green)] transition-colors hover:bg-[var(--theme-teal)] md:right-2"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5 theme-text-teal transition-colors group-hover:text-white" strokeWidth={2.25} />
            </button>
          </div>

          <div className="mt-8 flex justify-center font-sans">
            <Link
              href="/tour-builder/tours"
              className="theme-btn-teal group inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold tracking-wide"
            >
              Browse all tours
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.25} />
            </Link>
          </div>
        </>
      )}

      {showFocusText && focusText && (
        <div className="mt-12 md:mt-16 flex justify-center">
          <div className="max-w-3xl px-6 py-8 md:py-10 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-[var(--theme-teal)] to-transparent" />
            <p className="font-sans theme-text text-lg md:text-xl font-medium leading-relaxed text-center">{focusText}</p>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-[var(--theme-teal)] to-transparent" />
          </div>
        </div>
      )}

      <div className="mt-12 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-section-bg)] px-6 py-8 md:mt-16 md:px-10 md:py-10">
        <div className="flex w-full flex-col items-center">
          <div className="mb-4 flex items-center gap-3 font-sans">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--theme-teal)] md:w-12" />
            <span className="theme-text-teal text-xl font-semibold uppercase tracking-[0.16em] md:text-2xl">Make It Yours</span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--theme-teal)] md:w-12" />
          </div>
          <SectionHeader subtitle="Pick places, set dates, add hotels and transport — your plan, your style" />
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 font-sans md:flex-row md:gap-4">
          <Link
            className="theme-btn-teal group inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold tracking-wide"
            href="/tour-builder"
          >
            Start Building
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.25} />
          </Link>

          <Link
            className="inline-flex items-center gap-2 rounded-full border border-[var(--theme-teal)] bg-[var(--theme-bg)] px-6 py-2.5 text-sm font-semibold tracking-wide theme-text-teal transition-colors hover:bg-[var(--theme-card-bg)]"
            href="/tour-builder/tours"
          >
            Explore Ideas
          </Link>
        </div>
      </div>
    </section>
  );
};

const TourSuggestionsHeading: React.FC = () => (
  <div className="mb-8 flex w-full flex-col items-center md:mb-10">
    <div className="mb-4 flex items-center gap-3 font-sans">
      <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--theme-teal)] md:w-12" />
      <span className="theme-text-teal text-xl font-semibold uppercase tracking-[0.16em] md:text-2xl">Curated Tours</span>
      <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--theme-teal)] md:w-12" />
    </div>
    <SectionHeader subtitle={SECTION_SUBTITLE} />
  </div>
);

const TourSuggestionsCard: React.FC<{ tour: Tour; width: number }> = ({ tour, width }) => (
  <article
    className="group flex-shrink-0 overflow-hidden rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-bg)] shadow-[0_12px_30px_-22px_var(--theme-deep-green)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--theme-teal)] hover:shadow-[0_24px_45px_-24px_var(--theme-deep-green)]"
    style={{ width }}
  >
    <div className="relative h-44 overflow-hidden bg-[var(--theme-section-bg)]">
      <CardImageWithFallback
        fallbackSrc={TOUR_CARD_FALLBACK_IMAGE}
        alt={tour.name}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {tour.days > 0 && (
        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[var(--theme-bg)]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] theme-text-teal">
          <CalendarDays className="h-3 w-3" strokeWidth={2.25} />
          {tour.days} {tour.days === 1 ? "Day" : "Days"}
        </span>
      )}

      <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[var(--theme-bg)]/90 px-2.5 py-1 text-[11px] font-semibold">
        <Star className="h-3 w-3 theme-star" fill="currentColor" strokeWidth={0} />
        <span className="theme-text">{tour.rating > 0 ? tour.rating.toFixed(1) : "New"}</span>
      </span>

      <div className="absolute bottom-3 left-4 flex w-fit items-center gap-1.5 rounded-full bg-[var(--theme-teal)] px-2 py-1 text-white">
        <MapPin className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2.25} style={{ color: "#FFFFFF" }} />
        <span className="truncate text-xs font-medium tracking-wide">{tour.place}</span>
      </div>
    </div>

    <div className="flex flex-col gap-3 p-5">
      <h3 className="theme-text truncate text-[17px] font-semibold leading-snug tracking-tight">{tour.name}</h3>

      <div className="flex items-center gap-1.5 theme-text-teal text-[11px] font-medium">
        <QrCode className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
        <span className="truncate">Cashless experience included</span>
      </div>

      <div className="h-px w-full bg-[var(--theme-border-subtle)]" />

      <div className="flex items-end justify-between gap-3">
        {tour.price > 0 ? (
          <div className="flex flex-col">
            <span className="theme-text-subtle text-[10px] font-semibold uppercase tracking-[0.16em]">From</span>
            <span className="theme-text text-lg font-semibold leading-tight">
              ৳ {tour.price.toLocaleString()}
              <span className="theme-text-muted text-xs font-normal"> / package</span>
            </span>
          </div>
        ) : (
          <span className="theme-text-muted text-xs">Price on request</span>
        )}

        <Link
          href={`/tour-builder/tours/${tour.id}`}
          className="theme-btn-teal flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide"
        >
          View Details
        </Link>
      </div>
    </div>
  </article>
);
