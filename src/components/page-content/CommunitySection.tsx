import React from "react";
import { SectionHeader } from "./SectionHeader";

type Buddy = { id: string; name: string; tag: string; trips: number };

export const CommunitySection: React.FC<{ buddies: Buddy[], className?: string; focusText?: string }> = ({ buddies, className, focusText }) => {
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
            <div className="h-16 w-16 rounded-full theme-avatar mb-3" />
            <div className="theme-text font-medium">{b.name}</div>
            <div className="theme-text-muted text-sm">#{b.tag}</div>
            <div className="mt-2 text-xs theme-text-subtle">Trips: {b.trips}</div>
            <button className="mt-3 w-full rounded-lg py-2 text-sm theme-btn-teal">Say Hi</button>
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
