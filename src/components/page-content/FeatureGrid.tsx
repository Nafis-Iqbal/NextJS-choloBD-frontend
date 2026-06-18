import React from "react";
import { SectionHeader } from "./SectionHeader";

type Feature = { title: string; desc: string; link: string };

export const FeatureGrid: React.FC<{ features: Feature[]; className?: string; focusText?: string}> = ({ features, className, focusText }) => {
  return (
    <section className={`w-full ${className ?? ""}`}>
      <SectionHeader
        title="Your Complete Cashless Travel Companion"
        subtitle="QR payments, instant tickets, zero cash hassles — everything you need in one platform"
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
      {focusText && (
        <div className="mt-12 md:mt-32 flex justify-center">
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
