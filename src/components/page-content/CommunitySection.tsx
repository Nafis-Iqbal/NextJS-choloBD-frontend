import React from "react";
import { SectionHeader } from "./SectionHeader";

type Buddy = { id: string; name: string; tag: string; trips: number };

export const CommunitySection: React.FC<{ buddies: Buddy[], className?: string }> = ({ buddies, className }) => {
  return (
    <section className={`w-full scroll-mt-36 ${className}`} id="community">
      <SectionHeader
        title="Find People To Go With"
        subtitle="Join trips, start groups, and meet friendly travelers"
        className="mb-6"
      />
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
    </section>
  );
};
