"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageSquareQuote, Quote } from "lucide-react";
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

// The marquee wrap distance is derived from card width + gap, so both must stay in sync.
const CARD_GAP = 24;

const SECTION_SUBTITLE = "Real voices from happy trips across Bangladesh";

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
    animationSpeed,
    CARD_GAP
  );

  return (
    <section className={`w-full scroll-mt-36 ${className}`} id="testimonials">
      <div className="mb-8 flex w-full flex-col items-center md:mb-10">
        <div className="mb-4 flex items-center gap-3 font-sans">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--theme-teal)] md:w-12" />
          <span className="theme-text-teal text-xl font-semibold uppercase tracking-[0.16em] md:text-2xl">Traveler Stories</span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--theme-teal)] md:w-12" />
        </div>
        <SectionHeader subtitle={SECTION_SUBTITLE} />
      </div>

      {isLoading ? (
        <div className="flex gap-6 overflow-hidden font-sans">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 animate-pulse overflow-hidden rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-bg)] p-6"
              style={{ width: cardWidth }}
            >
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full theme-placeholder opacity-20" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-4 w-2/3 rounded theme-placeholder opacity-20" />
                  <div className="h-3 w-1/2 rounded theme-placeholder opacity-15" />
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-2">
                <div className="h-3 w-full rounded theme-placeholder opacity-15" />
                <div className="h-3 w-11/12 rounded theme-placeholder opacity-15" />
                <div className="h-3 w-3/4 rounded theme-placeholder opacity-15" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-bg)] px-6 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full theme-section">
            <MessageSquareQuote className="h-5 w-5 theme-text-teal" strokeWidth={1.75} />
          </span>
          <p className="theme-text text-base font-semibold">No traveler reviews yet</p>
          <p className="theme-text-muted text-sm">Stories from completed trips will appear here soon.</p>
        </div>
      ) : (
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
            <motion.div className="flex font-sans" style={{ x: animationStyle, gap: CARD_GAP }}>
              {[...items, ...items, ...items].map((review, idx) => (
                <TestimonialCard key={`${review.id}-${idx}`} review={review} width={cardWidth} />
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
      )}
    </section>
  );
};

const TestimonialCard: React.FC<{ review: Testimonial; width: number }> = ({ review, width }) => (
  <article
    className="group relative flex flex-shrink-0 flex-col overflow-hidden rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-bg)] p-6 shadow-[0_12px_30px_-22px_var(--theme-deep-green)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--theme-teal)] hover:shadow-[0_24px_45px_-24px_var(--theme-deep-green)]"
    style={{ width }}
  >
    <Quote
      className="absolute right-5 top-5 h-8 w-8 theme-text-teal opacity-15"
      fill="currentColor"
      strokeWidth={0}
      aria-hidden
    />

    <div className="flex items-center gap-3">
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-[var(--theme-teal)] bg-[var(--theme-section-bg)]">
        {review.imageUrl ? (
          <img src={review.imageUrl} alt={review.name} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-sm font-semibold theme-text-teal">
            {getReviewerInitials(review.name)}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <h3 className="theme-text truncate text-base font-semibold leading-snug tracking-tight">{review.name}</h3>
        <p className="theme-text-subtle text-xs">{review.reviewDate}</p>
      </div>
    </div>

    <div className="my-4 h-px w-full bg-[var(--theme-border-subtle)]" />

    <p className="theme-text-muted line-clamp-5 text-sm leading-relaxed">{review.reviewContent}</p>
  </article>
);
