import React from "react";
import { SectionHeader } from "./SectionHeader";

type Buddy = { id: string; name: string; tag: string; trips: number };

export const CommunitySection: React.FC<{ buddies: Buddy[] }> = ({ buddies }) => {
  return (
    <section className="w-full">
      <SectionHeader
        title="Find People To Go With"
        subtitle="Join trips, start groups, and meet friendly travelers"
        className="mb-6"
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 font-sans">
        {buddies.map((b) => (
          <div key={b.id} className="rounded-xl bg-gray-800/70 border border-gray-700 p-4">
            <div className="h-16 w-16 rounded-full bg-pink-600 mb-3" />
            <div className="text-white font-medium">{b.name}</div>
            <div className="text-gray-300 text-sm">#{b.tag}</div>
            <div className="mt-2 text-xs text-gray-400">Trips: {b.trips}</div>
            <button className="mt-3 w-full rounded-lg bg-violet-600 hover:bg-violet-700 text-white py-2 text-sm">Say Hi</button>
          </div>
        ))}
      </div>
    </section>
  );
};
