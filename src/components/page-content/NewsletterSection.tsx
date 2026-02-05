"use client";
import React from "react";
import { SectionHeader } from "./SectionHeader";

export const NewsletterSection: React.FC = () => {
  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    alert("Subscribed! (demo)");
  };

  return (
    <section className="w-full mb-4">
      <div className="rounded-2xl bg-gray-800/80 border border-gray-700 p-6 md:p-8 font-sans">
        <SectionHeader title="Get Travel Updates" subtitle="Fresh ideas, deals, and guides — straight to your inbox" />
        <form onSubmit={onSubmit} className="mt-5 flex flex-col md:flex-row gap-3 md:gap-4">
          <input
            type="email"
            placeholder="you@email.com"
            className="flex-1 rounded-lg bg-gray-900 text-white placeholder-gray-500 border border-gray-700 px-4 py-2"
            required
          />
          <button type="submit" className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};
