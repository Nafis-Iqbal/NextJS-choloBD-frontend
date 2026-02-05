import React from "react";
import { SectionHeader } from "./SectionHeader";

type Testimonial = { id: string; name: string; quote: string; place: string };

export const Testimonials: React.FC<{ items: Testimonial[] }> = ({ items }) => {
  return (
    <section className="w-full">
      <SectionHeader title="What Travelers Say" subtitle="Real voices from happy trips" className="mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        {items.map((t) => (
          <div key={t.id} className="rounded-xl bg-gray-800/70 border border-gray-700 p-5">
            <p className="text-gray-200">“{t.quote}”</p>
            <div className="mt-3 text-sm text-gray-400">— {t.name}, {t.place}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
