import React from "react";
import { SectionHeader } from "./SectionHeader";

type Feature = { title: string; desc: string };

export const FeatureGrid: React.FC<{ features: Feature[] }> = ({ features }) => {
  return (
    <section className="w-full">
      <SectionHeader
        title="Everything For Your Next Trip"
        subtitle="Suggest tours, build custom plans, book stays & rides, and meet buddies"
        className="mb-6"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 font-sans">
        {features.map((f, idx) => (
          <div
            key={idx}
            className="rounded-xl bg-gray-800/70 border border-gray-700 p-4 md:p-6 hover:bg-gray-800 transition"
          >
            <div className="text-lg md:text-xl font-medium text-white">{f.title}</div>
            <div className="mt-1 text-sm text-gray-300">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
