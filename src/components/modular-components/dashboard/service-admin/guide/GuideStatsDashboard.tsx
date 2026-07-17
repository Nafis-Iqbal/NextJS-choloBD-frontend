"use client";

import { useMemo } from "react";
import { BookingStatus, PaymentStatus } from "@/types/enums";

const StatCard: React.FC<{
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
}> = ({ label, value, unit, icon }) => (
  <div className="theme-card rounded-lg p-3 sm:p-4">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <div className="text-xl sm:text-2xl font-bold theme-text break-words">
          {value}
        </div>
        {unit && <div className="text-xs theme-text-subtle mt-1">{unit}</div>}
        <div className="text-xs theme-text-muted mt-2">{label}</div>
      </div>
      <div className="text-2xl sm:text-3xl shrink-0">{icon}</div>
    </div>
  </div>
);

function normalizeBookings(
  data: GuideBooking[] | { results?: GuideBooking[]; data?: GuideBooking[] } | null | undefined
): GuideBooking[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results || data.data || [];
}

export const GuideStatsDashboard: React.FC<{
  guide?: Guide | null;
  bookings?:
    | GuideBooking[]
    | {
        results?: GuideBooking[];
        data?: GuideBooking[];
        total?: number;
        page?: number;
        limit?: number;
      }
    | null;
  className?: string;
}> = ({ guide, bookings: bookingsProp, className }) => {
  const bookings = useMemo(
    () => normalizeBookings(bookingsProp),
    [bookingsProp]
  );

  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const pendingRequests = bookings.filter(
      (b) => b.status === BookingStatus.PENDING
    ).length;
    const activeBookings = bookings.filter(
      (b) =>
        b.status === BookingStatus.ACCEPTED ||
        b.status === BookingStatus.CONFIRMED
    ).length;
    const completedBookings = bookings.filter(
      (b) => b.status === BookingStatus.COMPLETED
    ).length;
    const totalEarnings = bookings
      .filter((b) => b.paymentStatus === PaymentStatus.PAID)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const pendingEarnings = bookings
      .filter((b) => b.paymentStatus === PaymentStatus.UNPAID)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    return {
      totalBookings,
      pendingRequests,
      activeBookings,
      completedBookings,
      totalEarnings,
      pendingEarnings,
      rating: guide?.rating ?? 0,
      pricePerDay: guide?.pricePerDay ?? 0,
    };
  }, [bookings, guide]);

  return (
    <section className={`mb-8 ${className || ""}`}>
      <h2 className="text-xl sm:text-2xl font-bold theme-text mb-4 sm:mb-6">
        Guide Statistics
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Earnings"
          value={`৳ ${stats.totalEarnings.toLocaleString()}`}
          icon="💰"
        />
        <StatCard
          label="Pending Amount"
          value={`৳ ${stats.pendingEarnings.toLocaleString()}`}
          icon="⏳"
        />
        <StatCard
          label="Active Bookings"
          value={stats.activeBookings}
          unit={`/ ${stats.totalBookings} total`}
          icon="📅"
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingRequests}
          icon="📥"
        />
        <StatCard
          label="Completed Tours"
          value={stats.completedBookings}
          icon="✓"
        />
        <StatCard
          label="Daily Rate"
          value={`৳ ${stats.pricePerDay.toLocaleString()}`}
          icon="💳"
        />
        <StatCard
          label="Guide Rating"
          value={stats.rating.toFixed(1)}
          unit="/ 5"
          icon="⭐"
        />
        <StatCard
          label="Reviews"
          value={guide?._count?.reviews ?? 0}
          icon="💬"
        />
      </div>
    </section>
  );
};
