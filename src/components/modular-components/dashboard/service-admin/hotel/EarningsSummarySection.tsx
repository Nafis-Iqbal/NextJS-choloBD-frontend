"use client";

import { useMemo } from "react";
import { HotelBookingApi } from "@/services/api";
import { BookingStatus, PaymentStatus } from "@/types/enums";

function formatShortDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "2-digit",
    month: "short",
    day: "2-digit",
  });
}

function calculateNights(checkIn: Date | string, checkOut: Date | string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, diff);
}

function getStatusBadge(status: BookingStatus) {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return {
        label: "✓ Confirmed",
        className: "px-3 py-1 rounded-full text-xs font-medium",
        style: {
          color: "var(--theme-teal)",
          backgroundColor: "rgba(42, 157, 143, 0.2)",
        },
      };
    case BookingStatus.PENDING:
      return {
        label: "⏳ Pending",
        className: "px-3 py-1 rounded-full text-xs font-medium",
        style: {
          color: "var(--theme-star)",
          backgroundColor: "rgba(212, 160, 23, 0.2)",
        },
      };
    case BookingStatus.CANCELLED:
      return {
        label: "✕ Cancelled",
        className: "px-3 py-1 rounded-full text-xs font-medium text-red-400",
        style: { backgroundColor: "rgba(239, 68, 68, 0.3)" },
      };
    default:
      return {
        label: String(status),
        className: "px-3 py-1 rounded-full text-xs font-medium theme-text-muted",
        style: { backgroundColor: "var(--theme-card-bg)" },
      };
  }
}

// Earnings Summary Section
export const EarningsSummarySection = ({
  hotelId,
  className,
  id,
}: {
  hotelId: string;
  className?: string;
  id?: string;
}) => {
  const { data: bookingsResponse, isLoading } = HotelBookingApi.useGetBookingsRQ(
    `hotelId=${hotelId}`
  );

  const bookings = useMemo(() => {
    const data = bookingsResponse?.data;
    if (Array.isArray(data)) {
      return data;
    }
    return data?.data || [];
  }, [bookingsResponse]);

  const { totalEarnings, pendingEarnings } = useMemo(() => {
    const completed = bookings
      .filter((b: HotelRoomBooking) => b.paymentStatus === PaymentStatus.PAID)
      .reduce((sum: number, b: HotelRoomBooking) => sum + b.totalPrice, 0);

    const pending = bookings
      .filter((b: HotelRoomBooking) => b.paymentStatus === PaymentStatus.UNPAID)
      .reduce((sum: number, b: HotelRoomBooking) => sum + b.totalPrice, 0);

    return { totalEarnings: completed, pendingEarnings: pending };
  }, [bookings]);

  if (isLoading) {
    return (
      <section className={`mb-8 ${className || ""}`} id={id}>
        <h2 className="text-xl sm:text-2xl font-bold theme-text mb-4 sm:mb-6">
          Earnings Summary
        </h2>
        <p className="theme-text-subtle">Loading bookings...</p>
      </section>
    );
  }

  return (
    <section className={`mb-8 ${className || ""}`} id={id}>
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

      {/* Mobile card list */}
      <div
        className="rounded-xl overflow-y-auto max-h-[80vh] min-h-[40vh] p-3 md:hidden"
        style={{
          backgroundColor: "var(--theme-card-bg)",
          border: "1px solid var(--theme-deep-green)",
        }}
      >
        {bookings.length > 0 ? (
          <div className="space-y-3">
            {bookings.map((booking: HotelRoomBooking) => {
              const nights = calculateNights(
                booking.checkInDate,
                booking.checkOutDate
              );
              const statusBadge = getStatusBadge(booking.status);
              const guestName =
                booking.user?.firstName || booking.guestName || "Unknown Guest";

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
                      <div className="theme-text-muted text-sm mt-1 flex flex-col gap-0.5">
                        <span>
                          {formatShortDate(booking.checkInDate)} →{" "}
                          {formatShortDate(booking.checkOutDate)}
                        </span>
                        <span>
                          {nights} night{nights === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 ${statusBadge.className}`}
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

      {/* Desktop table */}
      <div className="theme-card rounded-xl overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead
              className="bg-inherit"
              style={{
                backgroundColor: "var(--theme-section-bg)",
                borderBottom: "1px solid var(--theme-deep-green)",
              }}
            >
              <tr>
                <th className="px-6 py-3 theme-text font-semibold">Guest Name</th>
                <th className="px-6 py-3 theme-text font-semibold">Check-in</th>
                <th className="px-6 py-3 theme-text font-semibold">Check-out</th>
                <th className="px-6 py-3 theme-text font-semibold">Nights</th>
                <th className="px-6 py-3 theme-text font-semibold">Amount</th>
                <th className="px-6 py-3 theme-text font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking: HotelRoomBooking) => {
                  const nights = calculateNights(
                    booking.checkInDate,
                    booking.checkOutDate
                  );
                  const statusBadge = getStatusBadge(booking.status);

                  return (
                    <tr
                      key={booking.id}
                      className="text-center"
                      style={{ borderBottom: "1px solid var(--theme-deep-green)" }}
                    >
                      <td className="px-6 py-3 theme-text">
                        {booking.user?.firstName || booking.guestName}
                      </td>
                      <td className="px-6 py-3 theme-text-muted text-sm">
                        {formatShortDate(booking.checkInDate)}
                      </td>
                      <td className="px-6 py-3 theme-text-muted text-sm">
                        {formatShortDate(booking.checkOutDate)}
                      </td>
                      <td className="px-6 py-3 theme-text-muted">{nights}</td>
                      <td className="px-6 py-3 theme-text font-semibold">
                        ৳ {booking.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={statusBadge.className}
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
