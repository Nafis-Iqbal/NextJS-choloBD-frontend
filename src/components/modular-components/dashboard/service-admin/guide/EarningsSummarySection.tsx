"use client";

import { useMemo } from "react";
import { GuideBookingApi } from "@/services/api";
import { BookingStatus, PaymentStatus } from "@/types/enums";

function formatShortDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "2-digit",
    month: "short",
    day: "2-digit",
  });
}

function normalizeBookings(
  data: GuideBooking[] | { results?: GuideBooking[]; data?: GuideBooking[] } | null | undefined
): GuideBooking[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results || data.data || [];
}

function getStatusBadge(status: BookingStatus) {
  switch (status) {
    case BookingStatus.CONFIRMED:
    case BookingStatus.ACCEPTED:
      return {
        label: status === BookingStatus.CONFIRMED ? "✓ Confirmed" : "✓ Accepted",
        style: {
          color: "var(--theme-teal)",
          backgroundColor: "rgba(42, 157, 143, 0.2)",
        },
      };
    case BookingStatus.PENDING:
      return {
        label: "⏳ Pending",
        style: {
          color: "var(--theme-star)",
          backgroundColor: "rgba(212, 160, 23, 0.2)",
        },
      };
    case BookingStatus.COMPLETED:
      return {
        label: "✓ Completed",
        style: {
          color: "var(--theme-text-muted)",
          backgroundColor: "var(--theme-section-bg)",
        },
      };
    case BookingStatus.CANCELLED:
    case BookingStatus.DECLINED:
      return {
        label: status === BookingStatus.DECLINED ? "✕ Declined" : "✕ Cancelled",
        style: { color: "#b91c1c", backgroundColor: "rgba(239, 68, 68, 0.25)" },
      };
    default:
      return {
        label: String(status),
        style: {
          color: "var(--theme-text-muted)",
          backgroundColor: "var(--theme-section-bg)",
        },
      };
  }
}

export const EarningsSummarySection: React.FC<{
  guideId: string;
  className?: string;
}> = ({ guideId, className }) => {
  const { data: bookingsResponse, isLoading } =
    GuideBookingApi.useGetGuideBookingsRQ(
      guideId ? `guideId=${guideId}` : undefined
    );

  const bookings = useMemo(
    () => normalizeBookings(bookingsResponse?.data),
    [bookingsResponse?.data]
  );

  const { totalEarnings, pendingEarnings } = useMemo(() => {
    const completed = bookings
      .filter((b) => b.paymentStatus === PaymentStatus.PAID)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const pending = bookings
      .filter((b) => b.paymentStatus === PaymentStatus.UNPAID)
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    return { totalEarnings: completed, pendingEarnings: pending };
  }, [bookings]);

  if (isLoading) {
    return (
      <section className={`mb-8 ${className || ""}`}>
        <h2 className="text-xl sm:text-2xl font-bold theme-text mb-4">
          Earnings Summary
        </h2>
        <p className="theme-text-subtle">Loading earnings...</p>
      </section>
    );
  }

  return (
    <section className={`mb-8 ${className || ""}`}>
      <h2 className="text-xl sm:text-2xl font-bold theme-text mb-4 sm:mb-6">
        Earnings Summary
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="theme-card rounded-xl p-3 sm:p-4">
          <p className="theme-text-muted text-xs sm:text-sm">Total Completed</p>
          <p className="text-xl sm:text-3xl font-bold theme-text-teal mt-2 break-words">
            ৳ {totalEarnings.toLocaleString()}
          </p>
        </div>
        <div className="theme-card rounded-xl p-3 sm:p-4">
          <p className="theme-text-muted text-xs sm:text-sm">Pending Amount</p>
          <p
            className="text-xl sm:text-3xl font-bold mt-2 break-words"
            style={{ color: "var(--theme-star)" }}
          >
            ৳ {pendingEarnings.toLocaleString()}
          </p>
        </div>
        <div className="theme-card rounded-xl p-3 sm:p-4">
          <p className="theme-text-muted text-xs sm:text-sm">Total Bookings</p>
          <p className="text-xl sm:text-3xl font-bold theme-text-teal mt-2">
            {bookings.length}
          </p>
        </div>
      </div>

      <div
        className="rounded-xl overflow-y-auto max-h-[80vh] min-h-[40vh] p-3 md:hidden"
        style={{
          backgroundColor: "var(--theme-card-bg)",
          border: "1px solid var(--theme-deep-green)",
        }}
      >
        {bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const statusBadge = getStatusBadge(booking.status);
              const guestName =
                booking.user?.userName ||
                `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.trim() ||
                "Unknown Guest";

              return (
                <div
                  key={booking.id}
                  className="rounded-lg p-3 overflow-hidden"
                  style={{
                    backgroundColor: "var(--theme-bg)",
                    border: "1px solid var(--theme-deep-green)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="min-w-0 flex-1">
                      <p className="theme-text font-semibold break-words">
                        {guestName}
                      </p>
                      <p className="theme-text-muted text-sm mt-1">
                        {formatShortDate(booking.bookingDate)}
                      </p>
                      <p className="theme-text-subtle text-xs mt-1">
                        {booking.travelerCount} traveler
                        {booking.travelerCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span
                      className="shrink-0 px-3 py-1 rounded-full text-xs font-medium"
                      style={statusBadge.style}
                    >
                      {statusBadge.label}
                    </span>
                  </div>
                  <p className="theme-text font-semibold mt-3 text-base">
                    ৳ {booking.totalPrice.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center theme-text-subtle">
            No bookings found
          </div>
        )}
      </div>

      <div className="theme-card rounded-xl overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              style={{
                backgroundColor: "var(--theme-section-bg)",
                borderBottom: "1px solid var(--theme-deep-green)",
              }}
            >
              <tr>
                <th className="px-6 py-3 theme-text font-semibold text-left">
                  Guest
                </th>
                <th className="px-6 py-3 theme-text font-semibold text-left">
                  Date
                </th>
                <th className="px-6 py-3 theme-text font-semibold text-left">
                  Travelers
                </th>
                <th className="px-6 py-3 theme-text font-semibold text-left">
                  Amount
                </th>
                <th className="px-6 py-3 theme-text font-semibold text-left">
                  Payment
                </th>
                <th className="px-6 py-3 theme-text font-semibold text-left">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking) => {
                  const statusBadge = getStatusBadge(booking.status);
                  const guestName =
                    booking.user?.userName ||
                    `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.trim() ||
                    "Unknown Guest";

                  return (
                    <tr
                      key={booking.id}
                      style={{
                        borderBottom: "1px solid var(--theme-deep-green)",
                      }}
                    >
                      <td className="px-6 py-3 theme-text">{guestName}</td>
                      <td className="px-6 py-3 theme-text-muted text-sm">
                        {formatShortDate(booking.bookingDate)}
                      </td>
                      <td className="px-6 py-3 theme-text-muted">
                        {booking.travelerCount}
                      </td>
                      <td className="px-6 py-3 theme-text font-semibold">
                        ৳ {booking.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 theme-text-muted text-sm">
                        {booking.paymentStatus || PaymentStatus.UNPAID}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={statusBadge.style}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center theme-text-subtle"
                  >
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
