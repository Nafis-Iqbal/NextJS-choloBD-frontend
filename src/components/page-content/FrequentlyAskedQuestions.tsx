"use client";

import React, { useState } from "react";
import { SectionHeader } from "./SectionHeader";

interface FAQItem {
  question: string;
  answer: string;
}

interface FrequentlyAskedQuestionsProps {
  className?: string;
  items?: FAQItem[];
}

const DEFAULT_FAQ_ITEMS: FAQItem[] = [
  {
    question: "How does CholoBD make travel cashless?",
    answer:
      "CholoBD lets travelers book major parts of a trip ahead of time, then use QR-based confirmations and digital records instead of managing cash at every stop."
  },
  {
    question: "Can I book hotels, tours, and activities from one platform?",
    answer:
      "Yes. The platform is designed to bring together stays, curated tours, local activities, and related travel planning so users can manage more of the trip in one place."
  },
  {
    question: "Do I need to print tickets or booking confirmations?",
    answer:
      "In most cases, no. The core idea is digital-first access, where users can rely on app or web-based confirmations rather than printed documents."
  },
  {
    question: "Can I customize my own trip plan?",
    answer:
      "Yes. CholoBD supports curated packages as well as builder-style planning so travelers can shape a trip around their preferred destinations, timing, and budget."
  },
  {
    question: "Are local guides and experiences available too?",
    answer:
      "Yes. Users can browse guide and activity options to make trips more immersive, whether they want cultural experiences, nature outings, or destination-specific help."
  },
  {
    question: "Will CholoBD also support mobile users?",
    answer:
      "Yes. The experience is being built to work across web and mobile so travelers can access plans, bookings, and confirmations wherever they are."
  }
];

export const FrequentlyAskedQuestions: React.FC<FrequentlyAskedQuestionsProps> = ({
  className = "",
  items = DEFAULT_FAQ_ITEMS
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={`w-full scroll-mt-36 ${className}`} id="faq">
      <SectionHeader
        title="Frequently Asked Questions"
        subtitle="Quick answers to the common things travelers want to know before planning with CholoBD"
        className="mb-6"
      />

      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 font-sans">
        {items.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={`${item.question}-${index}`}
              className="rounded-xl border border-[var(--theme-border-subtle)] bg-[var(--theme-card-bg)] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full px-5 py-4 md:px-6 md:py-5 flex items-center justify-between gap-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="theme-text font-medium text-sm md:text-base">{item.question}</span>
                <span
                  className={`text-2xl leading-none theme-text-muted transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>

              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-4 md:px-6 md:pb-5 border-t border-[var(--theme-border-subtle)]">
                    <p className="pt-4 theme-text-muted text-sm md:text-base leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
