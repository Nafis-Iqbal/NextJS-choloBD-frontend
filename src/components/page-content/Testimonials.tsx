import React from "react";
import { SectionHeader } from "./SectionHeader";

type Testimonial = { id: string; name: string; quote: string; place: string };

export const Testimonials: React.FC<{ items: Testimonial[], className: string }> = ({ items, className }) => {
  return (
    <section className={`w-full ${className}`} id="testimonials">
      <SectionHeader title="What Travelers Say" subtitle="Real voices from happy trips" className="mb-6" />
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
