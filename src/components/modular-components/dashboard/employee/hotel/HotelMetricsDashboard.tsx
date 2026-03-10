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
  <div className={`${color} rounded-lg p-4 text-white`}>
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-2xl font-bold">{value}</div>
    {unit && <div className="text-sm text-gray-200">{unit}</div>}
    <div className="text-xs text-gray-300 mt-1">{label}</div>
  </div>
);

export const HotelMetricsDashboard: React.FC<{ metrics: HotelMetrics; isReady?: boolean; className?: string }> = ({ metrics, isReady = false, className }) => (
  <section className={`mb-8 ${className}`}>
    <h2 className="text-2xl font-bold text-white mb-6">Hotel Metrics Overview</h2>

    {isReady === false ? (
      <FeatureUnderDevelopment moduleName="Hotel Metrics Dashboard"/>
    ): (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Occupancy Rate"
          value={metrics.occupancyRate.toFixed(1)}
          unit="%"
          icon="📊"
          color="bg-linear-to-br from-blue-600 to-blue-700"
        />
        <MetricCard
          label="Available Rooms"
          value={metrics.availableRooms}
          unit={`/ ${metrics.totalRooms}`}
          icon="🛏️"
          color="bg-linear-to-br from-green-600 to-green-700"
        />
        <MetricCard
          label="Check-ins Today"
          value={metrics.checkInsToday}
          icon="📥"
          color="bg-linear-to-br from-teal-600 to-teal-700"
        />
        <MetricCard
          label="Check-outs Today"
          value={metrics.checkOutsToday}
          icon="📤"
          color="bg-linear-to-br from-purple-600 to-purple-700"
        />
        <MetricCard
          label="Pending Complaints"
          value={metrics.pendingComplaints}
          icon="⚠️"
          color="bg-linear-to-br from-orange-600 to-orange-700"
        />
        <MetricCard
          label="Maintenance Tasks"
          value={metrics.maintenanceTasksPending}
          icon="🔧"
          color="bg-linear-to-br from-red-600 to-red-700"
        />
        <MetricCard
          label="Average Rating"
          value={metrics.averageRating}
          unit="/ 5"
          icon="⭐"
          color="bg-linear-to-br from-yellow-600 to-yellow-700"
        />
      </div>
    )}
  </section>
);
