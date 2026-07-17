import { PlaceholderFeatureWarning } from "@/components/placeholder-components/FeatureUnderDevelopment";
import React from "react";

export type Stats = {
  totalTourPlans: number;
  totalTripsUndertaken: number;
  totalFavourites: number;
  totalFriends: number;
};

// Stats Overview Section
export const StatsOverview: React.FC<{
  stats: Stats;
  className?: string;
  showFakeData?: boolean;
}> = ({ stats, className, showFakeData = false }) => (
  <section className={`mb-8 ${className || ''}`}>
    <h2 className="text-2xl font-bold theme-text mb-6">Your Stats</h2>

    {showFakeData && (
      <PlaceholderFeatureWarning moduleName="User Statistics Overview" />
    )}

    <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
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
          className="rounded-xl p-3 sm:p-6 transition-colors border"
          style={{
            backgroundColor: `color-mix(in srgb, var(--theme-card-bg) 60%, var(--theme-teal) 5%)`,
            borderColor: `var(--theme-deep-green)`,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = `var(--theme-teal)`)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = `var(--theme-deep-green)`)}
        >
          <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">{stat.icon}</div>
          <div className="text-xl sm:text-3xl font-bold" style={{ color: `var(--theme-teal)` }}>
            {stat.value}
          </div>
          <div className="text-xs sm:text-sm theme-text-subtle mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  </section>
);
