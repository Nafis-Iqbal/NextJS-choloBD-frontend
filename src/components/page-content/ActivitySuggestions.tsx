"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { ActivitySpotApi } from "@/services/api";
import { useAutoScrollMarquee } from "./useAutoScrollMarquee";
import { CardImageWithFallback } from "./CardImageWithFallback";
import { ACTIVITY_CARD_FALLBACK_IMAGE } from "./pageContentFallbackImages";

interface ActivitySuggestionsProps {
  animationSpeed?: number;
  cardWidth?: number;
  className?: string;
  focusText?: string;
}

interface ActivityCardData {
  id: string;
  name: string;
  location: string;
  rating: number;
  imageUrl?: string;
  entryCost?: number;
  activityType: string;
}

function formatActivityTypeLabel(value?: string) {
  if (!value) return "Activity";
  return value
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export const ActivitySuggestions: React.FC<ActivitySuggestionsProps> = ({
  animationSpeed = 25,
  cardWidth = 256,
  className = "",
  focusText,
}) => {
  const { data: activityResponse, isLoading, error } = ActivitySpotApi.useGetAllActivitySpotsRQ("isActive=true");

  const formattedActivities = useMemo<ActivityCardData[]>(() => {
    return (activityResponse?.data || []).slice(0, 10).map((activity: ActivitySpot) => ({
      id: activity.id,
      name: activity.name,
      location: activity.location?.name || "N/A",
      rating: activity.rating || 0,
      imageUrl: activity.images?.[0]?.url,
      entryCost: activity.entryCost,
      activityType: formatActivityTypeLabel(activity.activityType),
    }));
  }, [activityResponse?.data]);

  const { x, handleScrollLeft, handleScrollRight } = useAutoScrollMarquee(
    formattedActivities.length,
    cardWidth,
    animationSpeed
  );

  if (isLoading) {
    return (
      <section className={`w-full ${className}`} id="activities">
        <SectionHeader
          title="Add Memorable Activities To Every Trip"
          subtitle="Browse exciting local experiences, from nature escapes to adventure-packed day plans"
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

  if (error || formattedActivities.length === 0) {
    return (
      <section className={`w-full ${className}`} id="activities">
        <SectionHeader
          title="Add Memorable Activities To Every Trip"
          subtitle="Browse exciting local experiences, from nature escapes to adventure-packed day plans"
          className="mb-6"
        />
        <p className="theme-text-muted text-center py-8">No activity spots available at the moment.</p>
      </section>
    );
  }

  return (
    <section className={`w-full ${className}`} id="activities">
      <SectionHeader
        title="Add Memorable Activities To Every Trip"
        subtitle="Browse exciting local experiences, from nature escapes to adventure-packed day plans"
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
            {[...formattedActivities, ...formattedActivities, ...formattedActivities].map((activity, idx) => (
              <div key={`${activity.id}-${idx}`} className="flex-shrink-0 w-full md:w-100 rounded-xl theme-card p-4">
                <div className="h-35 rounded-lg theme-placeholder mb-3 overflow-hidden relative">
                  <CardImageWithFallback
                    src={activity.imageUrl}
                    fallbackSrc={ACTIVITY_CARD_FALLBACK_IMAGE}
                    alt={activity.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="theme-text font-medium truncate">{activity.name}</div>
                <div className="theme-text-muted text-sm truncate">{activity.location}</div>
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <span className="theme-star">{"★".repeat(Math.max(1, Math.round(activity.rating || 0)))}</span>
                  <span className="theme-text font-medium">
                    {activity.entryCost != null ? `৳${activity.entryCost}` : "Custom pricing"}
                  </span>
                </div>
                <div className="mt-2 text-xs font-medium text-teal-600 dark:text-teal-400 truncate">
                  {activity.activityType}
                </div>

                <Link
                  href={`/activity-spots/${activity.id}`}
                  className="mt-3 w-full rounded-lg py-2 text-sm block text-center transition-colors theme-btn-teal"
                >
                  View Activity
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
