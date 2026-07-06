"use client";
import React from "react";
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
      <div className="rounded-2xl theme-section p-6 md:p-8 font-sans">
        <SectionHeader 
          title="Stay Updated on Cashless Travel Deals" 
          subtitle="Get weekly tour offers, new destinations & QR payment tips straight to your inbox" 
        />
        <form onSubmit={onSubmit} className="mt-5 flex flex-col md:flex-row gap-3 md:gap-4">
          <input
            type="email"
            placeholder="you@email.com"
            className="flex-1 px-4 py-2 theme-input"
            required
          />
          <button type="submit" className="px-5 py-2.5 rounded-lg font-semibold theme-btn-teal">
            Subscribe Now
          </button>
        </form>
        <p className="text-xs theme-text-muted text-center mt-2">We respect your privacy. Unsubscribe anytime.</p>
      </div>
    </section>
  );
};
