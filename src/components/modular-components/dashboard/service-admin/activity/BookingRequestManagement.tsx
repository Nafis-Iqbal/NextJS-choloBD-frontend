"use client";

import React, { useMemo, useState } from "react";
import { ActivitySpotBookingApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { BookingStatus, PaymentStatus } from "@/types/enums";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";

function formatDate(value?: Date | string | null): string {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function normalizeBookings(
  data:
    | ActivityBooking[]
    | { results?: ActivityBooking[]; data?: ActivityBooking[] }
    | null
    | undefined
): ActivityBooking[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results || data.data || [];
}

function getStatusBadge(status: BookingStatus) {
  switch (status) {
    case BookingStatus.PENDING:
      return {
        label: "Pending",
        style: {
          color: "var(--theme-star)",
          backgroundColor: "rgba(212, 160, 23, 0.2)",
        },
      };
    case BookingStatus.CONFIRMED:
      return {
        label: "Confirmed",
        style: {
          color: "var(--theme-teal)",
          backgroundColor: "rgba(42, 157, 143, 0.25)",
        },
      };
    case BookingStatus.COMPLETED:
      return {
        label: "Completed",
        style: {
          color: "var(--theme-text-muted)",
          backgroundColor: "var(--theme-section-bg)",
        },
      };
    case BookingStatus.CANCELLED:
      return {
        label: "Cancelled",
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

export const BookingRequestManagement: React.FC<{
  activitySpotId: string;
  className?: string;
  id?: string;
}> = ({ activitySpotId, className, id }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { openNotificationPopUpMessage } = useGlobalUI();

  const { data: bookingsResponse, isLoading, refetch } =
    ActivitySpotBookingApi.useGetActivityBookingsRQ(
      activitySpotId ? { activitySpotId } : undefined
    );

  const bookings = useMemo(
    () => normalizeBookings(bookingsResponse?.data),
    [bookingsResponse?.data]
  );

  const { mutate: cancelBookingMutation } =
    ActivitySpotBookingApi.useCancelActivityBookingRQ(
      (responseData) => {
        setProcessingId(null);
        setCancelReason("");
        setExpandedId(null);
        if (responseData.status === "success") {
          openNotificationPopUpMessage(
            responseData.message || "Booking cancelled"
          );
          queryClient.invalidateQueries({ queryKey: ["activityBookings"] });
          refetch();
        } else {
          openNotificationPopUpMessage(
            responseData.message || "Failed to cancel booking"
          );
        }
      },
      (error) => {
        setProcessingId(null);
        openNotificationPopUpMessage(
          error?.message || "Failed to cancel booking"
        );
      }
    );

  const pendingBookings = bookings.filter(
    (b) => b.status === BookingStatus.PENDING
  );
  const confirmedBookings = bookings.filter(
    (b) => b.status === BookingStatus.CONFIRMED
  );
  const otherBookings = bookings.filter(
    (b) =>
      b.status !== BookingStatus.PENDING &&
      b.status !== BookingStatus.CONFIRMED
  );

  const handleCancel = (bookingId: string, reason?: string) => {
    setProcessingId(bookingId);
    cancelBookingMutation({ bookingId, reason });
  };

  const renderBookingCard = (booking: ActivityBooking) => {
    const statusBadge = getStatusBadge(booking.status);
    const guestName =
      booking.user?.userName ||
      `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.trim() ||
      "Unknown Guest";
    const canCancel =
      booking.status === BookingStatus.PENDING ||
      booking.status === BookingStatus.CONFIRMED;
    const isExpanded = expandedId === booking.id;

    return (
      <div
        key={booking.id}
        className="rounded-lg p-3 sm:p-4 overflow-hidden"
        style={{
          backgroundColor: "var(--theme-bg)",
          border: "1px solid var(--theme-deep-green)",
        }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="theme-text font-semibold break-words">
                  {guestName}
                </p>
                <p className="theme-text-subtle text-sm mt-1 break-words">
                  {formatDate(booking.bookingDate)}
                </p>
                <p className="theme-text-subtle text-xs mt-1">
                  {booking.participantCount} participant
                  {booking.participantCount === 1 ? "" : "s"}
                  {booking.confirmationCode
                    ? ` · ${booking.confirmationCode}`
                    : ""}
                </p>
              </div>
              <span
                className="shrink-0 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium"
                style={statusBadge.style}
              >
                {statusBadge.label}
              </span>
            </div>

            {(booking.specialRequirements || booking.specialRequests) && (
              <p className="theme-text-muted text-sm mt-2 break-words">
                Notes: {booking.specialRequirements || booking.specialRequests}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="theme-text font-semibold">
                ৳ {booking.totalPrice.toLocaleString()}
              </span>
              <span className="theme-text-subtle text-xs">
                Payment: {booking.paymentStatus || PaymentStatus.UNPAID}
              </span>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row flex-wrap gap-2 shrink-0">
            {canCancel && (
              <button
                disabled={processingId === booking.id}
                onClick={() =>
                  setExpandedId(isExpanded ? null : booking.id)
                }
                className="w-full sm:w-auto px-3 py-2 text-white text-xs rounded-lg font-medium disabled:opacity-50"
                style={{ backgroundColor: "var(--theme-red, #dc2626)" }}
              >
                {isExpanded ? "Close" : "Cancel Booking"}
              </button>
            )}
          </div>
        </div>

        {isExpanded && canCancel && (
          <div
            className="mt-3 pt-3 border-t"
            style={{ borderColor: "var(--theme-deep-green)" }}
          >
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancelling (optional)"
              className="w-full px-3 py-2 rounded-lg theme-input text-sm"
              rows={2}
            />
            <button
              disabled={processingId === booking.id}
              onClick={() =>
                handleCancel(booking.id, cancelReason || undefined)
              }
              className="mt-2 w-full sm:w-auto px-4 py-2 text-white text-xs rounded-lg font-medium disabled:opacity-50"
              style={{ backgroundColor: "var(--theme-red, #dc2626)" }}
            >
              Confirm Cancel
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderGroup = (title: string, items: ActivityBooking[]) => {
    if (items.length === 0) return null;
    return (
      <div>
        <h3 className="text-lg font-semibold theme-text-teal mb-3">{title}</h3>
        <div
          className="rounded-xl overflow-y-auto max-h-[80vh] min-h-[20vh] p-3 sm:p-4"
          style={{
            backgroundColor: "var(--theme-card-bg)",
            border: "1px solid var(--theme-deep-green)",
          }}
        >
          <div className="space-y-3">{items.map(renderBookingCard)}</div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <section className={`mb-8 ${className || ""}`} id={id}>
        <h2 className="text-xl sm:text-2xl font-bold theme-text mb-4">
          Booking Management
        </h2>
        <p className="theme-text-subtle">Loading bookings...</p>
      </section>
    );
  }

  return (
    <section className={`mb-8 ${className || ""}`} id={id}>
      {/* <h2 className="text-xl sm:text-2xl font-bold theme-text mb-4 sm:mb-6">
        Booking Management
      </h2> */}

      {bookings.length === 0 ? (
        <div className="theme-card rounded-xl p-6 text-center theme-text-subtle">
          No bookings found
        </div>
      ) : (
        <div className="space-y-6">
          {renderGroup("📥 Pending Payment", pendingBookings)}
          {renderGroup("📅 Confirmed", confirmedBookings)}
          {renderGroup("📋 History", otherBookings)}
        </div>
      )}
    </section>
  );
};
