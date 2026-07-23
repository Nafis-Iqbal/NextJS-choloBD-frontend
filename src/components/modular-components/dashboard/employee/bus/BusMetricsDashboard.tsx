"use client";

import React from "react";
import type { BusEmployeeMetrics } from "./types";

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
}> = ({ label, value, unit, icon }) => (
  <div
    className="rounded-lg p-2.5 sm:p-4 overflow-hidden transition-colors"
    style={{
      backgroundColor: "var(--theme-bg)",
      border: "1px solid var(--theme-deep-green)",
      color: "var(--theme-text)",
    }}
  >
    <div className="text-xl sm:text-3xl mb-1 sm:mb-2">{icon}</div>
    <div
      className="text-lg sm:text-2xl font-bold tabular-nums"
      style={{ color: "var(--theme-teal)" }}
    >
      {value}
    </div>
    {unit && (
      <div className="text-[10px] sm:text-sm" style={{ color: "var(--theme-text-muted)" }}>
        {unit}
      </div>
    )}
    <div
      className="text-[10px] sm:text-xs mt-1 leading-tight"
      style={{ color: "var(--theme-text-subtle)" }}
    >
      {label}
    </div>
  </div>
);

export const BusMetricsDashboard: React.FC<{
  metrics: BusEmployeeMetrics;
  className?: string;
}> = ({ metrics, className }) => (
  <section className={`mb-8 ${className || ""}`} id="bus_employee_metrics">
    <h2
      className="text-xl sm:text-2xl font-bold mb-4"
      style={{ color: "var(--theme-text)" }}
    >
      Operations Overview
    </h2>

    <div
      className="rounded-xl p-3 sm:p-4"
      style={{
        backgroundColor: "var(--theme-card-bg)",
        border: "1px solid var(--theme-deep-green)",
      }}
    >
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        <MetricCard
          label="Departures Today"
          value={metrics.departuresToday}
          icon="🚌"
        />
        <MetricCard
          label="Boarding Pending"
          value={metrics.boardingPending}
          icon="🎫"
        />
        <MetricCard
          label="Open Seats"
          value={metrics.openSeats}
          icon="💺"
        />
        <MetricCard
          label="Booked Seats"
          value={metrics.bookedSeats}
          icon="✅"
        />
        <MetricCard
          label="Active Buses"
          value={metrics.activeBuses}
          icon="🛣️"
        />
        <MetricCard
          label="Maintenance Pending"
          value={metrics.maintenancePending}
          icon="🔧"
        />
        <MetricCard
          label="Cancelled Tickets"
          value={metrics.cancelledTicketsToday}
          unit="Today"
          icon="⚠️"
        />
      </div>
    </div>
  </section>
);
