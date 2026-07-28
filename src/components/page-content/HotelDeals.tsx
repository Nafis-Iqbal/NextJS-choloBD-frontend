"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { HotelApi } from "@/services/api";
import { useAutoScrollMarquee } from "./useAutoScrollMarquee";
import { CardImageWithFallback } from "./CardImageWithFallback";
import { HOTEL_CARD_FALLBACK_IMAGE } from "./pageContentFallbackImages";

interface HotelDealsProps {
  animationSpeed?: number; // Duration in seconds (default: 30)
  cardWidth?: number; // Card width in pixels (default: 256 which is w-64)
  className?: string;
  focusText?: string;
}

export const HotelDeals: React.FC<HotelDealsProps> = ({ animationSpeed = 25, cardWidth = 256, className = '', focusText }) => {
  const { data: hotelsResponse, isLoading, error } = HotelApi.useGetPopularHotelsRQ();

  const formattedHotels = useMemo(() => {
    return (hotelsResponse?.data || []).map((hotel: Hotel) => ({
      id: hotel.id,
      name: hotel.name,
      city: hotel.location?.name || "N/A",
      rating: hotel.rating || 0,
      imageUrl: hotel.images?.[0]?.url,
    }));
  }, [hotelsResponse?.data]);

  const { x, handleScrollLeft, handleScrollRight } = useAutoScrollMarquee(
    formattedHotels.length,
    cardWidth,
    animationSpeed
  );

  if (isLoading) {
    return (
      <section className={`w-full ${className}`} id="hotels">
        <SectionHeader 
          title="Stay Comfortably — Pay QR, Rest Easy" 
          subtitle="Handpicked hotels & resorts with instant cashless check-in across Bangladesh" 
          className="mb-6" 
        />
        <div className="flex gap-4 md:gap-6 font-sans overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64 rounded-xl theme-card p-4 animate-pulse">
              <div className="h-24 rounded-lg theme-placeholder opacity-30 mb-3" />
              <div className="h-4 theme-section rounded mb-2" />
              <div className="h-3 theme-section rounded w-3/4 mb-2" />
              <div className="h-8 theme-placeholder opacity-20 rounded mt-3" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error || formattedHotels.length === 0) {
    return (
      <section className={`w-full ${className}`} id="hotels">
        <SectionHeader 
          title="Stay Comfortably — Pay QR, Rest Easy" 
          subtitle="Handpicked hotels & resorts with instant cashless check-in across Bangladesh" 
          className="mb-6" 
        />
        <p className="theme-text-muted text-center py-8">No hotels available at the moment.</p>
      </section>
    );
  }

  return (
    <section className={`w-full ${className}`} id="hotels">
      <SectionHeader 
        title="Stay Comfortably — Pay QR, Rest Easy" 
        subtitle="Handpicked hotels & resorts with instant cashless check-in across Bangladesh" 
        className="mb-6" 
      />
      
      <div className="relative w-full">
        {/* Left Arrow Button */}
        <button
          onClick={handleScrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 theme-btn-teal rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-lg"
          aria-label="Scroll left"
        >
          ←
        </button>

        <div className="w-full overflow-hidden px-12">
          <motion.div
            className="flex gap-4 md:gap-6 font-sans"
            style={{ x }}
          >
            {[...formattedHotels, ...formattedHotels, ...formattedHotels].map((h, idx) => (
              <div key={`${h.id}-${idx}`} className="flex-shrink-0 w-full md:w-100 rounded-xl theme-card p-4">
                <div className="h-35 rounded-lg theme-placeholder mb-3 overflow-hidden relative">
                  <CardImageWithFallback
                    src={h.imageUrl}
                    fallbackSrc={HOTEL_CARD_FALLBACK_IMAGE}
                    alt={h.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="theme-text font-medium truncate">{h.name}</div>
                <div className="theme-text-muted text-sm truncate">{h.city}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="theme-star text-sm">{"★".repeat(Math.round(h.rating))}</span>
                </div>
                <div className="mt-2 text-xs font-medium text-teal-600 dark:text-teal-400">
                  ✓ Cashless Ready • Instant Confirmation
                </div>
                
                <Link href={`/hotels/${h.id}`} className="mt-3 w-full rounded-lg py-2 text-sm block text-center transition-colors theme-btn-teal">View Details</Link>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Arrow Button */}
        <button
          onClick={handleScrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 theme-btn-teal rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-lg"
          aria-label="Scroll right"
        >
          →
        </button>
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
