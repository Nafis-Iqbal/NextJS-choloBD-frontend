"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { GuideApi } from "@/services/api";
import { useAutoScrollMarquee } from "./useAutoScrollMarquee";
import { CardImageWithFallback } from "./CardImageWithFallback";
import { GUIDE_CARD_FALLBACK_IMAGE } from "./pageContentFallbackImages";

interface GuideSuggestionsProps {
  animationSpeed?: number;
  cardWidth?: number;
  className?: string;
  focusText?: string;
}

interface GuideCardData {
  id: string;
  name: string;
  location: string;
  rating: number;
  imageUrl?: string;
  pricePerDay?: number;
  specialization: string;
}

function formatListLabel(values?: string[]) {
  if (!values || values.length === 0) return "Local Guide";
  return values
    .slice(0, 2)
    .map((value) =>
      value
        .split("_")
        .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
        .join(" ")
    )
    .join(" • ");
}

export const GuideSuggestions: React.FC<GuideSuggestionsProps> = ({
  animationSpeed = 25,
  cardWidth = 256,
  className = "",
  focusText,
}) => {
  const { data: guidesResponse, isLoading, error } = GuideApi.useGetAllGuidesRQ({
    isActive: true,
    limit: 10,
  });

  const formattedGuides = useMemo<GuideCardData[]>(() => {
    const rawGuides = Array.isArray(guidesResponse?.data)
      ? guidesResponse.data
      : guidesResponse?.data?.results || [];

    return rawGuides.map((guide: Guide) => ({
      id: guide.id,
      name: `${guide.firstName || ""} ${guide.lastName || ""}`.trim() || "Guide",
      location: guide.location?.name || "N/A",
      rating: guide.rating || 0,
      imageUrl: guide.images?.[0]?.url,
      pricePerDay: guide.pricePerDay,
      specialization: formatListLabel(guide.specializations),
    }));
  }, [guidesResponse?.data]);

  const { x, handleScrollLeft, handleScrollRight } = useAutoScrollMarquee(
    formattedGuides.length,
    cardWidth,
    animationSpeed
  );

  if (isLoading) {
    return (
      <section className={`w-full ${className}`} id="guides">
        <SectionHeader
          title="Travel With Trusted Local Guides"
          subtitle="Experienced guides to help you explore Bangladesh with confidence, context, and ease"
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

  if (error || formattedGuides.length === 0) {
    return (
      <section className={`w-full ${className}`} id="guides">
        <SectionHeader
          title="Travel With Trusted Local Guides"
          subtitle="Experienced guides to help you explore Bangladesh with confidence, context, and ease"
          className="mb-6"
        />
        <p className="theme-text-muted text-center py-8">No guides available at the moment.</p>
      </section>
    );
  }

  return (
    <section className={`w-full ${className}`} id="guides">
      <SectionHeader
        title="Travel With Trusted Local Guides"
        subtitle="Experienced guides to help you explore Bangladesh with confidence, context, and ease"
        className="mb-6"
      />

      <div className="relative w-full">
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
            {[...formattedGuides, ...formattedGuides, ...formattedGuides].map((guide, idx) => (
              <div key={`${guide.id}-${idx}`} className="flex-shrink-0 w-full md:w-100 rounded-xl theme-card p-4">
                <div className="h-35 rounded-lg theme-placeholder mb-3 overflow-hidden relative">
                  <CardImageWithFallback
                    src={guide.imageUrl}
                    fallbackSrc={GUIDE_CARD_FALLBACK_IMAGE}
                    alt={guide.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="theme-text font-medium truncate">{guide.name}</div>
                <div className="theme-text-muted text-sm truncate">{guide.location}</div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <span className="theme-star">{"★".repeat(Math.max(1, Math.round(guide.rating || 0)))}</span>
                  <span className="theme-text font-medium">
                    {guide.pricePerDay != null ? `৳${guide.pricePerDay}/day` : "Price on request"}
                  </span>
                </div>
                <div className="mt-2 text-xs font-medium text-teal-600 dark:text-teal-400 truncate">
                  {guide.specialization}
                </div>

                <Link
                  href={`/guides/${guide.id}`}
                  className="mt-3 w-full rounded-lg py-2 text-sm block text-center transition-colors theme-btn-teal"
                >
                  View Guide
                </Link>
              </div>
            ))}
          </motion.div>
        </div>

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
