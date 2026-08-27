"use client";

import React, { useMemo, useState } from "react";
import { TransportBookingApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { BookingStatus } from "@/types/enums";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { formatTransportEnumLabel } from "./types";

interface TicketManagementSectionProps {
  transportId: string;
  id?: string;
  className?: string;
}

function bookingPassengerLabel(booking: TransportBooking): string {
  const namedPassenger = booking.items?.find((item) => item.passengerName)?.passengerName;
  if (namedPassenger) return namedPassenger;

  const userName =
    booking.user?.userName ||
    `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.trim();
  return userName || "Unknown passenger";
}

function bookingSeatLabel(booking: TransportBooking): string {
  const seats = (booking.items || [])
    .map((item) => item.assignedSeatLabel)
    .filter(Boolean);
  if (seats.length > 0) return seats.join(", ");
  return booking.seatNumber || `${booking.passengerCount} passenger(s)`;
}

function getStatusStyle(status: BookingStatus): React.CSSProperties {
  switch (status) {
    case BookingStatus.CONFIRMED:
    case BookingStatus.ACCEPTED:
      return {
        backgroundColor: "rgba(42, 157, 143, 0.2)",
        color: "var(--theme-teal)",
      };
    case BookingStatus.PENDING:
      return {
        backgroundColor: "rgba(212, 160, 23, 0.2)",
        color: "var(--theme-star)",
      };
    case BookingStatus.CANCELLED:
    case BookingStatus.DECLINED:
    case BookingStatus.REFUNDED:
      return {
        backgroundColor: "rgba(220, 53, 69, 0.2)",
        color: "var(--theme-red)",
      };
    default:
      return {
        backgroundColor: "var(--theme-section-bg)",
        color: "var(--theme-text-muted)",
      };
  }
}

export const TicketManagementSection = ({
  transportId,
  id,
  className = "",
}: TicketManagementSectionProps) => {
  const { showLoadingContent, openNotificationPopUpMessage } = useGlobalUI();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const {
    data: bookingsResponse,
    isLoading,
    isError,
    refetch,
  } = TransportBookingApi.useGetTransportBookingsRQ(
    transportId ? { transportId, limit: 50 } : undefined
  );

  const bookings = useMemo(() => {
    const payload = bookingsResponse?.data;
    if (!payload) return [];
    return Array.isArray(payload) ? payload : [];
  }, [bookingsResponse?.data]);

  const confirmedTickets = bookings.filter(
    (booking) =>
      booking.status === BookingStatus.CONFIRMED ||
      booking.status === BookingStatus.PENDING ||
      booking.status === BookingStatus.ACCEPTED
  );
  const cancelledTickets = bookings.filter(
    (booking) =>
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.REFUNDED
  );

  const { mutate: cancelBookingMutate } = TransportBookingApi.useCancelTransportBookingRQ(
    (response) => {
      showLoadingContent(false);
      if (response.status === "success") {
        setSelectedTicket(null);
        setCancelReason("");
        queryClient.invalidateQueries({ queryKey: ["transportBookings"] });
        refetch();
        openNotificationPopUpMessage("Booking cancelled.");
      } else {
        openNotificationPopUpMessage(response.message || "Failed to cancel booking.");
      }
    },
    (error) => {
      showLoadingContent(false);
      openNotificationPopUpMessage(error?.message || "Failed to cancel booking.");
    }
  );

  const canCancel = (status: BookingStatus) =>
    status === BookingStatus.PENDING ||
    status === BookingStatus.CONFIRMED ||
    status === BookingStatus.ACCEPTED;

  return (
    <section id={id} className={`mb-0 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="theme-card theme-outline-teal border rounded-xl p-4">
          <p className="text-sm theme-text-muted">Total Bookings</p>
          <p className="text-3xl font-bold theme-text-teal mt-2">{bookings.length}</p>
        </div>
        <div className="theme-card theme-outline-teal border rounded-xl p-4">
          <p className="text-sm theme-text-muted">Active Tickets</p>
          <p className="text-3xl font-bold theme-text-teal mt-2">
            {confirmedTickets.length}
          </p>
        </div>
        <div
          className="theme-card border rounded-xl p-4"
          style={{ borderColor: "var(--theme-red)" }}
        >
          <p className="text-sm theme-text-muted">Cancelled</p>
          <p className="text-3xl font-bold mt-2" style={{ color: "var(--theme-red)" }}>
            {cancelledTickets.length}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-sm p-4 text-center theme-text-subtle">Loading tickets...</div>
      ) : isError ? (
        <div className="rounded-sm p-4 text-center theme-text-subtle">
          Could not load transport bookings.
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-sm p-4 text-center theme-text-subtle">
          No tickets for this operator yet.
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const isExpanded = selectedTicket === booking.id;

            return (
              <div
                key={booking.id}
                className="theme-card theme-outline border rounded-lg p-4 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold theme-text">{bookingPassengerLabel(booking)}</p>
                    <p className="text-sm theme-text-muted mt-1">
                      {booking.confirmationCode} • Seat: {bookingSeatLabel(booking)}
                    </p>
                    <p className="text-sm theme-text-teal">
                      {booking.departureLocation} → {booking.arrivalLocation} • ৳{" "}
                      {Number(booking.totalPrice).toLocaleString()}
                    </p>
                    <p className="text-xs theme-text-subtle mt-1">
                      {new Date(booking.departureDateTime).toLocaleString()} •{" "}
                      {formatTransportEnumLabel(booking.paymentStatus)}
                    </p>
                  </div>
                  <div className="mt-3 md:mt-0 flex items-center gap-3">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={getStatusStyle(booking.status)}
                    >
                      {formatTransportEnumLabel(booking.status)}
                    </span>
                    {canCancel(booking.status) && (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTicket(isExpanded ? null : booking.id)
                        }
                        className="theme-section theme-text px-3 py-2 rounded-lg text-sm"
                      >
                        {isExpanded ? "Hide" : "Actions"}
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && canCancel(booking.status) && (
                  <div
                    className="mt-4 pt-4 border-t space-y-3"
                    style={{ borderColor: "var(--theme-deep-green)" }}
                  >
                    <input
                      type="text"
                      placeholder="Cancellation reason (optional)"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="theme-input w-full px-4 py-2.5 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        showLoadingContent(true);
                        cancelBookingMutate({
                          bookingId: booking.id,
                          cancellationReason: cancelReason.trim() || undefined,
                        });
                      }}
                      className="w-full px-4 py-2 rounded-lg font-medium theme-text"
                      style={{
                        backgroundColor: "rgba(220, 53, 69, 0.2)",
                        color: "var(--theme-red)",
                        border: "1px solid var(--theme-red)",
                      }}
                    >
                      Cancel Ticket
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
