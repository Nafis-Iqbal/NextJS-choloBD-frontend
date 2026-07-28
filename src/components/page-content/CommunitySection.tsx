"use client";

import React from "react";
import { Role } from "@/types/enums";
import { UserApi } from "@/services/api";
import { SectionHeader } from "./SectionHeader";
import { useRouter } from "next/navigation";

type Buddy = { id: string; name: string; tag: string; trips: number; imageUrl?: string };

const COMMUNITY_USERS_QUERY = new URLSearchParams({
    role: Role.USER,
    page: "1",
    limit: "4",
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

export const CommunitySection: React.FC<{ className?: string; focusText?: string }> = ({ className, focusText }) => {
  const { data: usersResponse } = UserApi.useGetUsersRQ(COMMUNITY_USERS_QUERY);
  const router = useRouter();

  const communityUsers = (usersResponse?.data?.results ?? [])
    .filter((user) => user.role === Role.USER)
    .slice(0, 4);

  const buddies = FALLBACK_BUDDIES.map((fallbackBuddy, index) => {
    const fetchedUser = communityUsers[index];

    if (!fetchedUser) {
      return fallbackBuddy;
    }

    return {
      id: fetchedUser.id || fallbackBuddy.id,
      name: getDisplayName(fetchedUser) || fallbackBuddy.name,
      tag: getTag(fetchedUser) || fallbackBuddy.tag,
      trips: fallbackBuddy.trips,
      imageUrl: fetchedUser.imageUrl || fallbackBuddy.imageUrl,
    };
  });

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 font-sans">
        {buddies.map((b) => (
          <div key={b.id} className="rounded-xl theme-card p-4">
            <div
              className="h-16 w-16 rounded-full theme-avatar mb-3"
              style={b.imageUrl ? { backgroundImage: `url(${b.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            />
            <div className="theme-text font-medium">{b.name}</div>
            <div className="theme-text-muted text-sm">#{b.tag}</div>
            <div className="mt-2 text-xs theme-text-subtle">Trips: {b.trips}</div>
            <button 
              className="mt-3 w-full rounded-lg py-2 text-sm theme-btn-teal"
              onClick={() => router.push(`/user_profile/${b.id}/public`)}
            >
              View Profile
            </button>
          </div>
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
    </section>
  );
};
