import React from "react";
import { FeatureUnderDevelopment, PlaceholderFeatureWarning } from "@/components/placeholder-components/FeatureUnderDevelopment";

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
  color: string;
}> = ({ label, value, unit, icon, color }) => (
  <div className="rounded-lg p-4" style={{backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-text)'}}>
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-2xl font-bold" style={{color: 'var(--theme-teal)'}}>{value}</div>
    {unit && <div className="text-sm" style={{color: 'var(--theme-text-muted)'}}>{unit}</div>}
    <div className="text-xs mt-1" style={{color: 'var(--theme-text-subtle)'}}>{label}</div>
  </div>
);

export const HotelMetricsDashboard: React.FC<{ metrics: HotelMetrics; isReady?: boolean; className?: string }> = ({ metrics, isReady = false, className }) => (
  <section className={`mb-8 ${className}`}>
    <h2 className="text-2xl font-bold mb-6" style={{color: 'var(--theme-text)'}}>Hotel Metrics Overview</h2>

    {isReady === false ? (
      <FeatureUnderDevelopment moduleName="Hotel Metrics Dashboard"/>
    ): (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Occupancy Rate"
          value={metrics.occupancyRate.toFixed(1)}
          unit="%"
          icon="📊"
          color=""
        />
        <MetricCard
          label="Available Rooms"
          value={metrics.availableRooms}
          unit={`/ ${metrics.totalRooms}`}
          icon="🛏️"
          color=""
        />
        <MetricCard
          label="Check-ins Today"
          value={metrics.checkInsToday}
          icon="📥"
          color=""
        />
        <MetricCard
          label="Check-outs Today"
          value={metrics.checkOutsToday}
          icon="📤"
          color=""
        />
        <MetricCard
          label="Pending Complaints"
          value={metrics.pendingComplaints}
          icon="⚠️"
          color=""
        />
        <MetricCard
          label="Maintenance Tasks"
          value={metrics.maintenanceTasksPending}
          icon="🔧"
          color=""
        />
        <MetricCard
          label="Average Rating"
          value={metrics.averageRating}
          unit="/ 5"
          icon="⭐"
          color=""
        />
      </div>
    )}
  </section>
);
