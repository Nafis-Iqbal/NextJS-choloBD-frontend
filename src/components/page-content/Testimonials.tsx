"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ReviewApi } from "@/services/api";
import { SectionHeader } from "./SectionHeader";
import { useAutoScrollMarquee } from "./useAutoScrollMarquee";

type Testimonial = {
  id: string;
  name: string;
  reviewContent: string;
  reviewDate: string;
  rawCreatedAt: string | number;
  imageUrl?: string;
};

const formatReviewDate = (createdAt?: Date | string): string => {
  if (!createdAt) return "Date unavailable";

  const parsedDate = new Date(createdAt);
  if (Number.isNaN(parsedDate.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
};

const getReviewerName = (review: Review): string => {
  const fullName = `${review.user?.firstName ?? ""} ${review.user?.lastName ?? ""}`.trim();
  return fullName || review.user?.userName || "Traveler";
};

const getReviewerInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words[0]?.[0] ?? "T") + (words[1]?.[0] ?? "");
};

export const Testimonials: React.FC<{
  className?: string;
  animationSpeed?: number;
  cardWidth?: number;
}> = ({ className, animationSpeed = 25, cardWidth = 320 }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      try {
        const response = await ReviewApi.getAllUserReviews({
          limit: 15,
          sortBy: "createdAt",
          sortOrder: "asc",
        });

        if (!isMounted) return;
        setReviews(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to fetch testimonial reviews:", error);
        if (isMounted) {
          setReviews([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, []);

  const items = useMemo<Testimonial[]>(() => {
    return [...reviews]
      .sort((a, b) => {
        const firstDate = new Date(a.createdAt ?? 0).getTime();
        const secondDate = new Date(b.createdAt ?? 0).getTime();
        return firstDate - secondDate;
      })
      .slice(0, 15)
      .map((review) => ({
        id: review.id,
        name: getReviewerName(review),
        reviewContent: review.description,
        reviewDate: formatReviewDate(review.createdAt),
        rawCreatedAt: new Date(review.createdAt ?? 0).getTime(),
        imageUrl: review.user?.imageUrl,
      }));
  }, [reviews]);

  const { x: animationStyle, handleScrollLeft, handleScrollRight } = useAutoScrollMarquee(
    items.length,
    cardWidth,
    animationSpeed
  );

  return (
    <section className={`w-full ${className}`} id="testimonials">
      <SectionHeader title="What Travelers Say" subtitle="Real voices from happy trips" className="mb-6" />

      {isLoading ? (
        <div className="theme-card rounded-xl px-6 py-10 text-center theme-text-muted">
          Loading traveler reviews...
        </div>
      ) : items.length === 0 ? (
        <div className="theme-card rounded-xl px-6 py-10 text-center theme-text-muted">
          No traveler reviews available right now.
        </div>
      ) : (
        <div className="relative w-full">
          <button
            onClick={handleScrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 theme-btn-teal rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-lg"
            aria-label="Scroll left"
          >
            ←
          </button>

          <div className="w-full overflow-hidden px-12">
            <motion.div className="flex gap-4 md:gap-6 font-sans" style={{ x: animationStyle }}>
              {[...items, ...items, ...items].map((review, idx) => (
                <div key={`${review.id}-${idx}`} className="flex-shrink-0 w-full md:w-100 rounded-xl theme-card p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-14 w-14 rounded-full theme-avatar flex items-center justify-center overflow-hidden text-sm font-semibold theme-text"
                      style={
                        review.imageUrl
                          ? {
                              backgroundImage: `url(${review.imageUrl})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }
                          : undefined
                      }
                    >
                      {!review.imageUrl ? getReviewerInitials(review.name) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="theme-text font-semibold truncate">{review.name}</div>
                      <div className="theme-text-muted text-sm">{review.reviewDate}</div>
                    </div>
                  </div>

                  <p className="mt-4 theme-text leading-7 line-clamp-5">"{review.reviewContent}"</p>
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
      )}
    </section>
  );
};
