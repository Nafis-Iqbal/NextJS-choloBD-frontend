import React from "react";
import { FeatureUnderDevelopment } from "@/components/placeholder-components/FeatureUnderDevelopment";

export type HotelMetrics = {
  occupancyRate: number;
  availableRooms: number;
  totalRooms: number;
  checkInsToday: number;
  checkOutsToday: number;
  pendingComplaints: number;
  maintenanceTasksPending: number;
  averageRating: number;
};

// Dashboard Metrics Component
const MetricCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
}> = ({ label, value, unit, icon }) => (
  <div
    className="rounded-lg p-3 sm:p-4 overflow-hidden transition-colors"
    style={{
      backgroundColor: "var(--theme-bg)",
      border: "1px solid var(--theme-deep-green)",
      color: "var(--theme-text)",
    }}
  >
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-2xl font-bold" style={{ color: "var(--theme-teal)" }}>
      {value}
    </div>
    {unit && (
      <div className="text-sm" style={{ color: "var(--theme-text-muted)" }}>
        {unit}
      </div>
    )}
    <div className="text-xs mt-1" style={{ color: "var(--theme-text-subtle)" }}>
      {label}
    </div>
  </div>
);

export const HotelMetricsDashboard: React.FC<{
  metrics: HotelMetrics;
  isReady?: boolean;
  className?: string;
}> = ({ metrics, isReady = false, className }) => (
  <section className={`mb-8 ${className || ""}`} id="hotel_metrics_dashboard">
    <h2
      className="text-xl sm:text-2xl font-bold mb-4"
      style={{ color: "var(--theme-text)" }}
    >
      Hotel Metrics Overview
    </h2>

    {isReady === false ? (
      <FeatureUnderDevelopment moduleName="Hotel Metrics Dashboard" />
    ) : (
      <div
        className="rounded-xl overflow-y-auto max-h-[80vh] min-h-[40vh] p-3 sm:p-4"
        style={{
          backgroundColor: "var(--theme-card-bg)",
          border: "1px solid var(--theme-deep-green)",
        }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard
            label="Occupancy Rate"
            value={metrics.occupancyRate.toFixed(1)}
            unit="%"
            icon="📊"
          />
          <MetricCard
            label="Available Rooms"
            value={metrics.availableRooms}
            unit={`/ ${metrics.totalRooms}`}
            icon="🛏️"
          />
          <MetricCard
            label="Check-ins Today"
            value={metrics.checkInsToday}
            icon="📥"
          />
          <MetricCard
            label="Check-outs Today"
            value={metrics.checkOutsToday}
            icon="📤"
          />
          <MetricCard
            label="Pending Complaints"
            value={metrics.pendingComplaints}
            icon="⚠️"
          />
          <MetricCard
            label="Maintenance Tasks"
            value={metrics.maintenanceTasksPending}
            icon="🔧"
          />
          <MetricCard
            label="Average Rating"
            value={metrics.averageRating}
            unit="/ 5"
            icon="⭐"
          />
        </div>
      </div>
    )}
  </section>
);
