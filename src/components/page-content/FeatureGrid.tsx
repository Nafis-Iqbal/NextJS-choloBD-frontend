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

export const FeatureGrid: React.FC<{ features: Feature[]; className?: string; focusText?: string; focusTitle?: string }> = ({
  features,
  className,
  focusText,
  focusTitle,
}) => {
  return (
    <section className={`w-full ${className ?? ""}`}>
      <div className="mb-8 flex w-full flex-col items-center md:mb-10">
        <div className="mb-4 flex items-center gap-3 font-sans">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--theme-teal)] md:w-12" />
          <span className="theme-text-teal text-xl font-semibold uppercase tracking-[0.16em] md:text-2xl">
            Why CholoBD
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--theme-teal)] md:w-12" />
        </div>
        <SectionHeader subtitle="QR payments, instant tickets, zero cash hassles — everything you need in one platform" />
      </div>

      <div className="grid grid-cols-2 gap-3 font-sans md:gap-6 lg:grid-cols-3">
        {features.map((f, idx) => {
          const Icon = FEATURE_ICONS[f.link] ?? Sparkles;

          return (
            <a
              key={idx}
              href={`/#${f.link}`}
              className="group flex min-h-0 flex-row items-start gap-3 rounded-2xl border border-[var(--theme-border-subtle)] bg-[var(--theme-bg)] px-3 py-3.5 shadow-[0_12px_30px_-22px_var(--theme-deep-green)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--theme-teal)] hover:shadow-[0_24px_45px_-24px_var(--theme-deep-green)] sm:gap-4 sm:px-4 sm:py-4 md:flex-col md:gap-4 md:p-6"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg theme-section transition-colors group-hover:bg-[var(--theme-teal)] md:h-12 md:w-12 md:rounded-xl">
                <Icon className="h-4 w-4 theme-text-teal transition-colors group-hover:text-white md:h-5 md:w-5" strokeWidth={1.75} />
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-1 md:gap-1.5">
                <h3 className="theme-text text-sm font-semibold leading-snug tracking-tight sm:text-base md:text-lg">{f.title}</h3>
                <p className="theme-text-muted text-xs leading-relaxed sm:text-sm">{f.desc}</p>

                <span className="mt-1 hidden items-center gap-1.5 theme-text-teal text-[11px] font-semibold uppercase tracking-[0.16em] md:mt-auto md:flex">
                  Explore
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.25} />
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {(focusTitle || focusText) && (
        <div className="mt-12 md:mt-32 flex justify-center">
          <div className="max-w-3xl px-6 py-8 md:py-10 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-[var(--theme-teal)] to-transparent" />
            {focusTitle && (
              <p className="font-sans theme-text text-xl md:text-2xl font-semibold leading-snug text-center">
                {focusTitle}
              </p>
            )}
            {focusText && (
              <p className={`font-sans theme-text-muted text-sm md:text-lg font-medium leading-relaxed text-center ${focusTitle ? "mt-3" : "theme-text text-lg md:text-xl"}`}>
                {focusText}
              </p>
            )}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-[var(--theme-teal)] to-transparent" />
          </div>
        </div>
      )}
    </section>
  );
};
