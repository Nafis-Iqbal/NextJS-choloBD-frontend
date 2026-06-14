import React from "react";
import { SectionHeader } from "./SectionHeader";

type Feature = { title: string; desc: string; link: string };

export const FeatureGrid: React.FC<{ features: Feature[]; className?: string}> = ({ features, className }) => {
  return (
    <section className={`w-full ${className ?? ""}`}>
      <SectionHeader
        title="Everything For Your Next Trip"
        subtitle="Suggest tours, build custom plans, book stays & rides, and meet buddies"
        className="mb-6"
      />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 font-sans">
        {features.map((f, idx) => (
          <a
            key={idx}
            href={`/#${f.link}`}
            className="rounded-xl theme-card p-4 md:p-6 hover:brightness-95 transition cursor-pointer block"
          >
            <div className="text-lg md:text-xl font-medium theme-text">{f.title}</div>
            <div className="mt-1 text-sm theme-text-muted">{f.desc}</div>
          </a>
        ))}
      </div>
    </section>
  );
};
