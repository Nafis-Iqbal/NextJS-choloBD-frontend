"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { HotelApi } from "@/services/api";

interface HotelDealsProps {
  animationSpeed?: number; // Duration in seconds (default: 30)
  cardWidth?: number; // Card width in pixels (default: 256 which is w-64)
  className?: string;
}

export const HotelDeals: React.FC<HotelDealsProps> = ({ animationSpeed = 25, cardWidth = 256, className = '' }) => {
  const { data: hotelsResponse, isLoading, error } = HotelApi.useGetPopularHotelsRQ();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const formattedHotels = useMemo(() => {
    return (hotelsResponse?.data || []).map((hotel: Hotel) => ({
      id: hotel.id,
      name: hotel.name,
      city: hotel.location?.name || "N/A",
      rating: hotel.rating || 0,
      imageUrl: hotel.images?.[0]?.url,
    }));
  }, [hotelsResponse?.data]);

  const cardGap = 16;
  const cardTotalWidth = cardWidth + cardGap;
  const scrollDistance = cardTotalWidth * formattedHotels.length;

  const handleScrollLeft = () => {
    setIsPaused(true);
    const newPosition = scrollPosition - cardTotalWidth;
    setScrollPosition(newPosition);
    setTimeout(() => setIsPaused(false), 500);
  };

  const handleScrollRight = () => {
    setIsPaused(true);
    const newPosition = scrollPosition + cardTotalWidth;
    setScrollPosition(newPosition);
    setTimeout(() => setIsPaused(false), 500);
  };

  if (isLoading) {
    return (
      <section className={`w-full ${className}`} id="hotels">
        <SectionHeader title="Hotel Deals" subtitle="Comfort stays at friendly prices" className="mb-6" />
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
        <SectionHeader title="Hotel Deals" subtitle="Comfort stays at friendly prices" className="mb-6" />
        <p className="theme-text-muted text-center py-8">No hotels available at the moment.</p>
      </section>
    );
  }

  return (
    <section className={`w-full ${className}`} id="hotels">
      <SectionHeader title="Hotel Deals" subtitle="Comfort stays at friendly prices" className="mb-6" />
      
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
            ref={scrollRef}
            className="flex gap-4 md:gap-6 font-sans"
            initial={{ x: 0 }}
            animate={isPaused ? { x: scrollPosition } : { x: -scrollDistance }}
            transition={{
              duration: isPaused ? 0.5 : animationSpeed,
              ease: isPaused ? "easeInOut" : "linear",
              repeat: isPaused ? 0 : Infinity,
            }}
          >
            {/* Duplicate hotels for seamless loop */}
            {[...formattedHotels, ...formattedHotels].map((h, idx) => (
              <div key={`${h.id}-${idx}`} className="flex-shrink-0 w-full md:w-100 rounded-xl theme-card p-4">
                <div className="h-35 rounded-lg theme-placeholder mb-3 overflow-hidden relative">
                  {h.imageUrl ? (
                    <Image 
                      src={h.imageUrl} 
                      alt={h.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full theme-placeholder" />
                  )}
                </div>
                <div className="theme-text font-medium truncate">{h.name}</div>
                <div className="theme-text-muted text-sm truncate">{h.city}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="theme-star text-sm">{"★".repeat(Math.round(h.rating))}</span>
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
    </section>
  );
};
