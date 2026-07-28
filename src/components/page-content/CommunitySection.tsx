"use client";

import React from "react";
import { Role } from "@/types/enums";
import { UserApi } from "@/services/api";
import { SectionHeader } from "./SectionHeader";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAutoScrollMarquee } from "./useAutoScrollMarquee";
import { CardImageWithFallback } from "./CardImageWithFallback";
import { COMMUNITY_CARD_FALLBACK_IMAGE } from "./pageContentFallbackImages";

type Buddy = { id: string; name: string; tag: string; trips: number; imageUrl?: string };

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
}> = ({ className, focusText, animationSpeed = 25, cardWidth = 256 }) => {
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
    animationSpeed
  );

  return (
    <section className={`w-full scroll-mt-36 ${className}`} id="community">
      <SectionHeader
        title="Find Your Travel Buddies"
        subtitle="Join or create groups for safer, more fun, and shared cashless trips"
        className="mb-6"
      />
      <div className="mb-6 text-center">
        <p className="theme-text text-sm md:text-base font-medium">
          💬 Chat • 💳 Split QR Payments • 🎒 Group Bookings
        </p>
      </div>
      <div className="relative w-full">
        <button
          onClick={handleScrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 theme-btn-teal rounded-full w-10 h-10 flex items-center justify-center transition-colors shadow-lg"
          aria-label="Scroll left"
        >
          ←
        </button>

        <div className="w-full overflow-hidden px-12">
          <motion.div className="flex gap-4 md:gap-6 font-sans" style={{ x }}>
            {[...buddies, ...buddies, ...buddies].map((b, idx) => (
              <div key={`${b.id}-${idx}`} className="flex-shrink-0 w-full md:w-100 rounded-xl theme-card p-4">
                <div className="h-16 w-16 rounded-full overflow-hidden theme-avatar mb-3">
                  <CardImageWithFallback
                    src={b.imageUrl}
                    fallbackSrc={COMMUNITY_CARD_FALLBACK_IMAGE}
                    alt={b.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="theme-text font-medium truncate">{b.name}</div>
                <div className="theme-text-muted text-sm truncate">#{b.tag}</div>
                <div className="mt-2 text-xs theme-text-subtle">Trips: {b.trips}</div>
                <button 
                  className="mt-3 w-full rounded-lg py-2 text-sm theme-btn-teal"
                  onClick={() => router.push(`/user_profile/${b.id}/public`)}
                >
                  View Profile
                </button>
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
