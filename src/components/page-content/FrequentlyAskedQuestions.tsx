"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
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
      <div className="mb-8 flex w-full flex-col items-center md:mb-10">
        <div className="mb-4 flex items-center gap-3 font-sans">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-[var(--theme-teal)] md:w-12" />
          <span className="theme-text-teal text-xl font-semibold uppercase tracking-[0.16em] md:text-2xl">Good To Know</span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-[var(--theme-teal)] md:w-12" />
        </div>
        <SectionHeader subtitle="Quick answers to the common things travelers want to know before planning with CholoBD" />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 font-sans">
        {items.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={`${item.question}-${index}`}
              className={`overflow-hidden rounded-2xl border bg-[var(--theme-bg)] transition-all duration-300 ${
                isOpen
                  ? "border-[var(--theme-teal)] shadow-[0_18px_40px_-28px_var(--theme-deep-green)]"
                  : "border-[var(--theme-border-subtle)] hover:border-[var(--theme-teal)]"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 bg-transparent px-5 py-4 text-left md:px-6 md:py-5"
                aria-expanded={isOpen}
              >
                <span className="theme-text text-sm font-semibold leading-snug tracking-tight md:text-base">
                  {item.question}
                </span>

                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    isOpen ? "bg-[var(--theme-teal)]" : "theme-section"
                  }`}
                  aria-hidden="true"
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-white" : "theme-text-teal"
                    }`}
                    strokeWidth={2.25}
                  />
                </span>
              </button>

              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-[var(--theme-border-subtle)] px-5 pb-5 md:px-6">
                    <p className="pt-4 theme-text-muted text-sm leading-relaxed md:text-base">{item.answer}</p>
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
