import React from "react";
import { ArrowUpRight, BadgePercent, CalendarCheck, CreditCard, QrCode, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

type Feature = { title: string; desc: string; link: string };

const FEATURE_ICONS: Record<string, React.ElementType> = {
  hotels: QrCode,
  transport: CreditCard,
  tours: CalendarCheck,
  community: ShieldCheck,
  wallet: Wallet,
  deals: BadgePercent,
};

export const FeatureGrid: React.FC<{ features: Feature[]; className?: string; focusText?: string}> = ({ features, className, focusText }) => {
  return (
    <section className={`w-full ${className ?? ""}`}>
      <div className="mb-8 flex w-full flex-col items-center md:mb-10">
        <div className="mb-4 flex items-center gap-3 font-sans">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--theme-teal)]" />
          <span className="theme-text-teal text-[11px] font-semibold uppercase tracking-[0.22em]">Why CholoBD</span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--theme-teal)]" />
        </div>
        <SectionHeader
          title="Your Complete Cashless Travel Companion"
          subtitle="QR payments, instant tickets, zero cash hassles — everything you need in one platform"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 font-sans sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {features.map((f, idx) => {
          const Icon = FEATURE_ICONS[f.link] ?? Sparkles;

          return (
            <a
              key={idx}
              href={`/#${f.link}`}
              className="group flex flex-col gap-4 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-bg)] p-5 shadow-[0_12px_30px_-22px_var(--theme-deep-green)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--theme-teal)] hover:shadow-[0_24px_45px_-24px_var(--theme-deep-green)] md:p-6"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl theme-section transition-colors group-hover:bg-[var(--theme-teal)]">
                <Icon className="h-5 w-5 theme-text-teal transition-colors group-hover:text-white" strokeWidth={1.75} />
              </span>

              <div className="flex flex-col gap-1.5">
                <h3 className="theme-text text-base font-semibold leading-snug tracking-tight md:text-lg">{f.title}</h3>
                <p className="theme-text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>

              <span className="mt-auto flex items-center gap-1.5 theme-text-teal text-[11px] font-semibold uppercase tracking-[0.16em]">
                Explore
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
              </span>
            </a>
          );
        })}
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
