import React from "react";
import { SectionHeader } from "./SectionHeader";
import type { HomeMessages } from "@/i18n/homeMessages";

type Testimonial = { id: string; name: string; quote: string; place: string };

export const Testimonials: React.FC<{ items: readonly Testimonial[]; className: string; copy: HomeMessages["testimonials"] }> = ({ items, className, copy }) => {
  return (
    <section className={`w-full ${className}`} id="testimonials">
      <SectionHeader title={copy.title} subtitle={copy.subtitle} className="mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
        {items.map((t) => (
          <div key={t.id} className="rounded-xl theme-card p-5">
            <p className="theme-text">"{t.quote}"</p>
            <div className="mt-3 text-sm theme-text-muted">— {t.name}, {t.place}</div>
          </div>
        ))}
      </div>
    </section>
  );
};
