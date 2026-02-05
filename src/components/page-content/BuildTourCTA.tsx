"use client";
import React from "react";
import { SectionHeader } from "./SectionHeader";
import Link from "next/link";

export const BuildTourCTA: React.FC = () => {
  const onStart = () => {
    // light fake action
    alert("Let’s build your tour! (demo)");
  };

  return (
    <section className="w-full">
      <div className="rounded-xl bg-section p-6 md:p-8">
        <SectionHeader
          title="Build Your Own Tour"
          subtitle="Pick places, set dates, add hotels and transport — your plan, your style"
          className="mb-4 bg-gray-700"
        />

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 font-sans">
          <Link
            className="px-5 py-2 rounded-md bg-white text-indigo-700 font-semibold hover:bg-gray-100 hover:scale-110"
            href="/tour-builder"
          >
            Start Building
          </Link>

          <Link 
            className="px-5 py-2 rounded-md bg-white text-indigo-700 font-semibold hover:bg-gray-100 hover:scale-110"
            href="tour-builder/tours"
          >
            Explore Ideas
          </Link>
        </div>
      </div>
    </section>
  );
};
