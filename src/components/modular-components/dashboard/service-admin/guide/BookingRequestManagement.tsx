"use client";

import React, { useMemo, useState } from "react";
import { GuideBookingApi } from "@/services/api";
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

function formatTime(value?: Date | string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
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
    case BookingStatus.PENDING:
      return {
        label: "Pending",
        style: {
          color: "var(--theme-star)",
          backgroundColor: "rgba(212, 160, 23, 0.2)",
        },
      };
    case BookingStatus.ACCEPTED:
      return {
        label: "Accepted",
        style: {
          color: "var(--theme-teal)",
          backgroundColor: "rgba(42, 157, 143, 0.2)",
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
    case BookingStatus.DECLINED:
      return {
        label: "Declined",
        style: { color: "#b91c1c", backgroundColor: "rgba(239, 68, 68, 0.2)" },
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
  guideId: string;
  className?: string;
}> = ({ guideId, className }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { openNotificationPopUpMessage } = useGlobalUI();

  const { data: bookingsResponse, isLoading, refetch } =
    GuideBookingApi.useGetGuideBookingsRQ(
      guideId ? `guideId=${guideId}` : undefined
    );

  const bookings = useMemo(
    () => normalizeBookings(bookingsResponse?.data),
    [bookingsResponse?.data]
  );

  const { mutate: updateStatusMutation } =
    GuideBookingApi.useUpdateGuideBookingStatusRQ(
      (responseData) => {
        setProcessingId(null);
        setDeclineReason("");
        if (responseData.status === "success") {
          openNotificationPopUpMessage(
            responseData.message || "Booking status updated"
          );
          queryClient.invalidateQueries({ queryKey: ["guideBookings"] });
          refetch();
        } else {
          openNotificationPopUpMessage(
            responseData.message || "Failed to update booking status"
          );
        }
      },
      (error) => {
        setProcessingId(null);
        openNotificationPopUpMessage(
          error?.message || "Failed to update booking status"
        );
      }
    );

  const pendingBookings = bookings.filter(
    (b) => b.status === BookingStatus.PENDING
  );
  const activeBookings = bookings.filter(
    (b) =>
      b.status === BookingStatus.ACCEPTED ||
      b.status === BookingStatus.CONFIRMED
  );
  const otherBookings = bookings.filter(
    (b) =>
      b.status !== BookingStatus.PENDING &&
      b.status !== BookingStatus.ACCEPTED &&
      b.status !== BookingStatus.CONFIRMED
  );

  const handleAction = (
    bookingId: string,
    action: "accept" | "decline" | "complete" | "cancel",
    reason?: string
  ) => {
    setProcessingId(bookingId);
    updateStatusMutation({
      bookingId,
      data: { action, reason },
    });
  };

  const renderBookingCard = (booking: GuideBooking) => {
    const statusBadge = getStatusBadge(booking.status);
    const guestName =
      booking.user?.userName ||
      `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.trim() ||
      "Unknown Guest";
    const start = formatTime(booking.startTime);
    const end = formatTime(booking.endTime);
    const schedule = start && end
      ? `${formatDate(booking.bookingDate)} · ${start} – ${end}`
      : formatDate(booking.bookingDate);

    const canAccept = booking.status === BookingStatus.PENDING;
    const canDecline = booking.status === BookingStatus.PENDING;
    const canComplete =
      booking.status === BookingStatus.ACCEPTED ||
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
                <p className="theme-text font-semibold break-words">{guestName}</p>
                <p className="theme-text-subtle text-sm mt-1 break-words">
                  {schedule}
                </p>
                <p className="theme-text-subtle text-xs mt-1">
                  {booking.travelerCount} traveler
                  {booking.travelerCount === 1 ? "" : "s"}
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
            {canAccept && (
              <button
                disabled={processingId === booking.id}
                onClick={() => handleAction(booking.id, "accept")}
                className="w-full sm:w-auto px-3 py-2 theme-btn-teal text-white text-xs rounded-lg font-medium disabled:opacity-50"
              >
                Accept
              </button>
            )}
            {canDecline && (
              <button
                disabled={processingId === booking.id}
                onClick={() =>
                  setExpandedId(isExpanded ? null : booking.id)
                }
                className="w-full sm:w-auto px-3 py-2 text-white text-xs rounded-lg font-medium disabled:opacity-50"
                style={{ backgroundColor: "var(--theme-red, #dc2626)" }}
              >
                {isExpanded ? "Cancel Decline" : "Decline"}
              </button>
            )}
            {canComplete && (
              <button
                disabled={processingId === booking.id}
                onClick={() => handleAction(booking.id, "complete")}
                className="w-full sm:w-auto px-3 py-2 theme-btn-teal text-white text-xs rounded-lg font-medium disabled:opacity-50"
              >
                Mark Complete
              </button>
            )}
          </div>
        </div>

        {isExpanded && canDecline && (
          <div
            className="mt-3 pt-3 border-t"
            style={{ borderColor: "var(--theme-deep-green)" }}
          >
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason for declining (optional)"
              className="w-full px-3 py-2 rounded-lg theme-input text-sm"
              rows={2}
            />
            <button
              disabled={processingId === booking.id}
              onClick={() =>
                handleAction(booking.id, "decline", declineReason || undefined)
              }
              className="mt-2 w-full sm:w-auto px-4 py-2 text-white text-xs rounded-lg font-medium disabled:opacity-50"
              style={{ backgroundColor: "var(--theme-red, #dc2626)" }}
            >
              Confirm Decline
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderGroup = (title: string, items: GuideBooking[]) => {
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
      <section className={`mb-8 ${className || ""}`}>
        <h2 className="text-xl sm:text-2xl font-bold theme-text mb-4">
          Booking Requests
        </h2>
        <p className="theme-text-subtle">Loading booking requests...</p>
      </section>
    );
  }

  return (
    <section className={`mb-8 ${className || ""}`}>
      <h2 className="text-xl sm:text-2xl font-bold theme-text mb-4 sm:mb-6">
        Booking Requests
      </h2>

      {bookings.length === 0 ? (
        <div className="theme-card rounded-xl p-6 text-center theme-text-subtle">
          No booking requests found
        </div>
      ) : (
        <div className="space-y-6">
          {renderGroup("📥 Pending Requests", pendingBookings)}
          {renderGroup("📅 Active / Confirmed", activeBookings)}
          {renderGroup("📋 History", otherBookings)}
        </div>
      )}
    </section>
  );
};
