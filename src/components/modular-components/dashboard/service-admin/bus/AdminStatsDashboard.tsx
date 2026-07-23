"use client";

import React from "react";
import type { AdminStats } from "./types";

const StatCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
}> = ({ label, value, unit, icon }) => (
  <div className="theme-card rounded-lg p-2.5 sm:p-4">
    <div className="flex items-start justify-between gap-1">
      <div className="min-w-0">
        <div className="text-base sm:text-2xl font-bold theme-text tabular-nums break-words">
          {value}
        </div>
        {unit && (
          <div className="text-[10px] sm:text-xs theme-text-subtle mt-0.5 sm:mt-1">
            {unit}
          </div>
        )}
        <div className="text-[10px] sm:text-xs theme-text-muted mt-1 sm:mt-2 leading-tight">
          {label}
        </div>
      </div>
      <div className="text-lg sm:text-3xl shrink-0">{icon}</div>
    </div>
  </div>
);

interface AdminStatsDashboardProps {
  stats: AdminStats;
  className?: string;
}

export const AdminStatsDashboard = ({
  stats,
  className = "",
}: AdminStatsDashboardProps) => (
  <section className={`mb-8 ${className}`}>
    <h2 className="text-2xl font-bold theme-text mb-6">Bus Service Statistics</h2>
    <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
      <StatCard
        label="Total Buses"
        value={stats.totalBuses}
        unit={`${stats.activeBuses} active`}
        icon="🚌"
      />
      <StatCard
        label="Total Rides"
        value={stats.totalRides}
        unit={`${stats.completedRides} completed`}
        icon="🛣️"
      />
      <StatCard
        label="Tickets Sold"
        value={stats.totalTicketsSold}
        unit="This month"
        icon="🎫"
      />
      <StatCard
        label="Total Revenue"
        value={`৳ ${(stats.totalRevenue / 1000).toFixed(0)}K`}
        icon="💰"
      />
      <StatCard
        label="Avg Ticket Price"
        value={`৳ ${stats.averageTicketPrice}`}
        icon="💳"
      />
      <StatCard
        label="Occupancy Rate"
        value={stats.occupancyRate.toFixed(1)}
        unit="%"
        icon="📊"
      />
      <StatCard
        label="Cancellation Rate"
        value={stats.cancellationRate.toFixed(1)}
        unit="%"
        icon="⚠️"
      />
    </div>
  </section>
);
