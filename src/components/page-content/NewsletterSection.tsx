"use client";
import React from "react";
import { SectionHeader } from "./SectionHeader";
import type { HomeMessages } from "@/i18n/homeMessages";

export const NewsletterSection: React.FC<{className: string; copy: HomeMessages["newsletter"]}> = ({className, copy}) => {
  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    alert(copy.submittedAlert);
  };

  return (
    <section className={`w-full mb-4 ${className}`}>
      <div className="rounded-2xl theme-section p-6 md:p-8 font-sans">
        <SectionHeader 
          title={copy.title}
          subtitle={copy.subtitle}
        />
        <form onSubmit={onSubmit} className="mt-5 flex flex-col md:flex-row gap-3 md:gap-4">
          <input
            type="email"
            placeholder={copy.placeholder}
            className="flex-1 px-4 py-2 theme-input"
            required
          />
          <button type="submit" className="px-5 py-2.5 rounded-lg font-semibold theme-btn-teal">
            {copy.subscribe}
          </button>
        </form>
        <p className="text-xs theme-text-muted text-center mt-2">{copy.privacy}</p>
      </div>
    </section>
  );
};
