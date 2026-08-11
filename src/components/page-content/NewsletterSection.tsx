"use client";
import React from "react";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";

export const NewsletterSection: React.FC<{className: string}> = ({className}) => {
  const { openNotificationPopUpMessage } = useGlobalUI();
  
  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    openNotificationPopUpMessage("Subscribed! (demo)");
  };

  return (
    <section className={`w-full mb-4 ${className}`}>
      <div className="relative overflow-hidden rounded-3xl border border-[var(--theme-border-subtle)] bg-[var(--theme-section-bg)] px-6 py-10 font-sans shadow-[0_18px_45px_-30px_var(--theme-deep-green)] md:px-10 md:py-12">
        <div className="flex w-full flex-col items-center">
          <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--theme-teal)]">
            <Mail className="h-5 w-5 text-white" strokeWidth={1.75} />
          </span>

          <SectionHeader
            title="Stay Updated on Cashless Travel Deals"
            subtitle="Get weekly tour offers, new destinations & QR payment tips straight to your inbox"
          />
        </div>

        <form onSubmit={onSubmit} className="mx-auto mt-7 flex w-full max-w-xl flex-col gap-3 md:flex-row">
          <input
            type="email"
            placeholder="you@email.com"
            className="theme-input flex-1 rounded-full px-5 py-3 text-sm"
            required
          />
          <button
            type="submit"
            className="theme-btn-teal group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-wide"
          >
            Subscribe Now
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.25} />
          </button>
        </form>

        <p className="mt-4 flex items-center justify-center gap-1.5 theme-text-muted text-xs">
          <ShieldCheck className="h-3.5 w-3.5 theme-text-teal" strokeWidth={2} />
          We respect your privacy. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
};
