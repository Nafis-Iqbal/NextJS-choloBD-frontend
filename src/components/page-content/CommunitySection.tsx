"use client";

import React from "react";
import { Role } from "@/types/enums";
import { UserApi } from "@/services/api";
import { SectionHeader } from "./SectionHeader";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CreditCard, MessageCircle, Users } from "lucide-react";
import { useAutoScrollMarquee } from "./useAutoScrollMarquee";
import { CardImageWithFallback } from "./CardImageWithFallback";
import { COMMUNITY_CARD_FALLBACK_IMAGE } from "./pageContentFallbackImages";

type Buddy = { id: string; name: string; tag: string; trips: number; imageUrl?: string };

// The marquee wrap distance is derived from card width + gap, so both must stay in sync.
const CARD_GAP = 24;

const SECTION_SUBTITLE = "Join or create groups for safer, more fun, and shared cashless trips";

const COMMUNITY_PERKS = [
  { icon: MessageCircle, label: "Chat" },
  { icon: CreditCard, label: "Split QR Payments" },
  { icon: Users, label: "Group Bookings" },
];

const COMMUNITY_USERS_QUERY = new URLSearchParams({
    role: Role.USER,
    page: "1",
    limit: "10",
}).toString();

const FALLBACK_BUDDIES: Buddy[] = [
    { id: "u1", name: "Nila", tag: "trekker", trips: 8 },
    { id: "u2", name: "Rafi", tag: "foodie", trips: 5 },
    { id: "u3", name: "Sumi", tag: "photog", trips: 12 },
    { id: "u4", name: "Tamal", tag: "chiller", trips: 6 },
];

const getDisplayName = (user: User): string => {
    const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    return fullName || user.userName || user.email || "Traveler";
};

const getTag = (user: User): string => {
    if (user.userName?.trim()) {
        return user.userName.trim();
    }

    return user.email ? user.email.split("@")[0] : "traveler";
};

export const CommunitySection: React.FC<{
  className?: string;
  focusText?: string;
  animationSpeed?: number;
  cardWidth?: number;
}> = ({ className, focusText, animationSpeed = 25, cardWidth = 260 }) => {
  const { data: usersResponse } = UserApi.useGetUsersRQ(COMMUNITY_USERS_QUERY);
  const router = useRouter();

  const communityUsers = (usersResponse?.data?.results ?? [])
    .filter((user) => user.role === Role.USER)
    .slice(0, 10);

  const buddies = communityUsers.length > 0
    ? communityUsers.map((user, index) => ({
        id: user.id,
        name: getDisplayName(user),
        tag: getTag(user),
        trips: 4 + (index % 9),
        imageUrl: user.imageUrl,
      }))
    : FALLBACK_BUDDIES;

  const { x, handleScrollLeft, handleScrollRight } = useAutoScrollMarquee(
    buddies.length,
    cardWidth,
    animationSpeed,
    CARD_GAP
  );

  return (
    <section className={`w-full scroll-mt-36 ${className}`} id="community">
      <div className="mb-6 flex w-full flex-col items-center">
        <div className="mb-4 flex items-center gap-3 font-sans">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--theme-teal)] md:w-12" />
          <span className="theme-text-teal text-xl font-semibold uppercase tracking-[0.16em] md:text-2xl">Travel Together</span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--theme-teal)] md:w-12" />
        </div>
        <SectionHeader subtitle={SECTION_SUBTITLE} />
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-center gap-2.5 font-sans md:gap-3">
        {COMMUNITY_PERKS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--theme-border-subtle)] bg-[var(--theme-bg)] px-3.5 py-1.5 text-xs font-medium theme-text"
          >
            <Icon className="h-3.5 w-3.5 theme-text-teal" strokeWidth={2} />
            {label}
          </span>
        ))}
      </div>

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
            {[...buddies, ...buddies, ...buddies].map((buddy, idx) => (
              <BuddyCard
                key={`${buddy.id}-${idx}`}
                buddy={buddy}
                width={cardWidth}
                onViewProfile={() => router.push(`/user_profile/${buddy.id}/public`)}
              />
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

const BuddyCard: React.FC<{ buddy: Buddy; width: number; onViewProfile: () => void }> = ({
  buddy,
  width,
  onViewProfile,
}) => (
  <article
    className="group flex flex-shrink-0 flex-col items-center gap-3 overflow-hidden rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-bg)] p-6 text-center shadow-[0_12px_30px_-22px_var(--theme-deep-green)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--theme-teal)] hover:shadow-[0_24px_45px_-24px_var(--theme-deep-green)]"
    style={{ width }}
  >
    <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-[var(--theme-teal)] bg-[var(--theme-section-bg)]">
      <CardImageWithFallback
        src={buddy.imageUrl}
        fallbackSrc={COMMUNITY_CARD_FALLBACK_IMAGE}
        alt={buddy.name}
        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
    </div>

    <div className="flex w-full flex-col gap-0.5">
      <h3 className="theme-text truncate text-base font-semibold leading-snug tracking-tight">{buddy.name}</h3>
      <span className="theme-text-muted truncate text-xs">#{buddy.tag}</span>
    </div>

    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--theme-border-subtle)] px-3 py-1 text-[11px] font-medium theme-text-muted">
      <Users className="h-3 w-3 theme-text-teal" strokeWidth={2.25} />
      {buddy.trips} trips
    </span>

    <button
      className="theme-btn-teal mt-1 w-full rounded-full px-4 py-2 text-xs font-semibold tracking-wide"
      onClick={onViewProfile}
    >
      View Profile
    </button>
  </article>
);
