import { PlaceholderFeatureWarning } from "@/components/placeholder-components/FeatureUnderDevelopment";
import React from "react";

export type Stats = {
  totalTourPlans: number;
  totalTripsUndertaken: number;
  totalFavourites: number;
  totalFriends: number;
};

// Stats Overview Section
export const StatsOverview: React.FC<{ stats: Stats; className?: string }> = ({ stats, className }) => (
  <section className={`mb-8 ${className || ''}`}>
    <h2 className="text-2xl font-bold text-white mb-6">Your Stats</h2>

    <PlaceholderFeatureWarning moduleName="User Statistics Overview" />

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        {
          label: "Tour Plans Built",
          value: stats.totalTourPlans,
          icon: "📋",
        },
        {
          label: "Trips Undertaken",
          value: stats.totalTripsUndertaken,
          icon: "✈️",
        },
        {
          label: "Favourites",
          value: stats.totalFavourites,
          icon: "❤️",
        },
        {
          label: "Friends",
          value: stats.totalFriends,
          icon: "👥",
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className="bg-linear-to-br from-teal-900/40 to-teal-700/20 border border-teal-600/50 rounded-xl p-6 hover:border-teal-500 transition-colors"
        >
          <div className="text-4xl mb-2">{stat.icon}</div>
          <div className="text-3xl font-bold text-teal-400">{stat.value}</div>
          <div className="text-sm text-gray-300 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  </section>
);
