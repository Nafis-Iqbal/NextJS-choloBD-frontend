"use client";

import React, { useState, useMemo } from "react";
import { PaginationControls } from "./PaginationControls";
import { ActivitySpotBookingApi, PaymentApi, WalletApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { ServiceType, PaymentStatus, BookingStatus, ComplaintTargetType } from "@/types/enums";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { PlaceholderFeatureWarning } from "@/components/placeholder-components/FeatureUnderDevelopment";
import {
  BookingPostStayActions,
  buildComplaintSubmitHref,
  hasBookingServiceStarted,
  isEligibleForReviewOrComplaint,
} from "./BookingPostStayActions";

function formatDate(value?: Date | string | null): string {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function normalizeActivityBookings(
  data:
    | ActivityBooking[]
    | { data?: ActivityBooking[]; results?: ActivityBooking[] }
    | null
    | undefined
): ActivityBooking[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.results || data.data || [];
}

interface BookingInfoCardProps {
  booking: ActivityBooking;
  selectedBookingId: string | null;
  setSelectedBookingId: (id: string | null) => void;
  paymentMethod: "wallet" | "card" | null;
  setPaymentMethod: (method: "wallet" | "card" | null) => void;
  isProcessingPayment: boolean;
  cancellingBookingId: string | null;
  onProceedPaymentClicked: (booking: ActivityBooking) => void;
  onBookingCancelledClicked: (bookingId: string) => void;
  onCancelAndRefundClicked: (bookingId: string) => void;
}

// Activity Booking History with Pagination
export const ActivityBookingHistorySection: React.FC<{
  bookings?: ActivityBooking[];
  userId?: string;
  itemsPerPage?: number;
  className?: string;
  showFakeData?: boolean;
}> = ({
  bookings: propBookings,
  userId,
  itemsPerPage = 5,
  className,
  showFakeData = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card" | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const { openNotificationPopUpMessage } = useGlobalUI();

  const { mutate: initializePaymentMutation } = PaymentApi.useInitializePaymentRQ(
    (responseData) => {
      setIsProcessingPayment(false);

      if (responseData.status === "success" && responseData.data?.gatewayPageURL) {
        window.location.assign(responseData.data.gatewayPageURL);
      } else {
        openNotificationPopUpMessage(
          responseData.message || "Payment initialization failed"
        );
      }
    },
    (error) => {
      setIsProcessingPayment(false);
      openNotificationPopUpMessage(
        error?.message || "Failed to initialize payment"
      );
    }
  );

  const { mutate: chargeWalletMutation } = WalletApi.useChargeWalletCreditsRQ(
    (responseData) => {
      setIsProcessingPayment(false);
      if (responseData.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["myWallet"] });
        queryClient.invalidateQueries({ queryKey: ["activityBookings"] });
        openNotificationPopUpMessage(
          responseData.message || "Payment completed successfully"
        );
        refetch();
      } else {
        openNotificationPopUpMessage(
          responseData.message || "Failed to charge wallet"
        );
      }
    },
    (error) => {
      setIsProcessingPayment(false);
      openNotificationPopUpMessage(
        error?.message || "Failed to process wallet payment"
      );
    }
  );

  const { data: bookingsResponse, isLoading, refetch } =
    ActivitySpotBookingApi.useGetActivityBookingsRQ(
      userId ? { userId, limit: 100 } : undefined
    );

  const { mutate: cancelBookingMutation } =
    ActivitySpotBookingApi.useCancelActivityBookingRQ(
      (responseData) => {
        setCancellingBookingId(null);
        if (responseData.status === "success") {
          openNotificationPopUpMessage(
            responseData.message || "Activity booking cancelled"
          );
          queryClient.invalidateQueries({ queryKey: ["activityBookings"] });
          refetch();
        } else {
          openNotificationPopUpMessage(
            responseData.message || "Failed to cancel activity booking"
          );
        }
      },
      (error) => {
        setCancellingBookingId(null);
        openNotificationPopUpMessage(
          error?.message || "Failed to cancel activity booking"
        );
      }
    );

  const bookings = useMemo(() => {
    if (propBookings && propBookings.length > 0) {
      return propBookings;
    }

    return normalizeActivityBookings(bookingsResponse?.data);
  }, [propBookings, bookingsResponse?.data]);

  const onProceedPaymentClicked = (booking: ActivityBooking) => {
    if (!paymentMethod) return;

    setIsProcessingPayment(true);

    if (paymentMethod === "card") {
      initializePaymentMutation({
        serviceType: ServiceType.ACTIVITY_BOOKING,
        serviceTypeId: booking.id,
        userId: userId,
        userName: booking.user?.userName || undefined,
        phone: booking.user?.phoneNumber || undefined,
        email: booking.user?.email || undefined,
        paymentAmount: booking.totalPrice,
      });
    } else if (paymentMethod === "wallet") {
      const creditsAmount = Math.floor(booking.totalPrice * 0.8);
      chargeWalletMutation({
        serviceType: ServiceType.ACTIVITY_BOOKING,
        serviceTypeId: booking.id,
        paymentAmount: creditsAmount,
      });
    }
  };

  const onBookingCancelledClicked = (bookingId: string) => {
    setCancellingBookingId(bookingId);
    setSelectedBookingId(null);
    setPaymentMethod(null);
    cancelBookingMutation({ bookingId });
  };

  const onCancelAndRefundClicked = (_bookingId: string) => {
    openNotificationPopUpMessage("Cancel and refund feature coming soon");
  };

  const header = (
    <div
      className="mb-3 md:mb-4 pb-2 md:pb-3 border-b-0 md:border-b"
      style={{ borderColor: "var(--theme-deep-green)" }}
    >
      <h2 className="text-xl sm:text-2xl font-bold theme-text-teal">
        Activity Booking History
      </h2>
    </div>
  );

  if (isLoading && (!propBookings || propBookings.length === 0)) {
    return (
      <section className={`mb-0 ${className || ""}`}>
        {header}
        <div className="rounded-sm p-4 text-center theme-text-subtle">
          Loading bookings...
        </div>
      </section>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <section className={`mb-0 ${className || ""}`}>
        {header}
        {showFakeData && (
          <PlaceholderFeatureWarning moduleName="Activity Booking History Details" />
        )}
        <div className="rounded-sm p-4 text-center theme-text-subtle">
          No activity bookings found
        </div>
      </section>
    );
  }

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = bookings.slice(startIdx, startIdx + itemsPerPage);

  return (
    <section className={`mb-0 ${className || ""}`}>
      {header}
      {showFakeData && (
        <PlaceholderFeatureWarning moduleName="Activity Booking History Details" />
      )}
      <div
        className="rounded-sm md:rounded-md overflow-y-auto max-h-[80vh] min-h-[40vh] px-0 py-2 md:p-2 border-0 md:border"
        style={{
          backgroundColor: "var(--theme-card-bg)",
          borderColor: "var(--theme-deep-green)",
        }}
      >
        <div className="space-y-2">
          {paginatedData.map((booking) => (
            <div
              key={booking.id}
              className="rounded-sm md:rounded p-2 md:p-3 transition-colors overflow-hidden border-0 md:border"
              style={{
                backgroundColor: "var(--theme-bg)",
                borderColor: "var(--theme-deep-green)",
              }}
            >
              <BookingInfoCard
                booking={booking}
                selectedBookingId={selectedBookingId}
                setSelectedBookingId={setSelectedBookingId}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                isProcessingPayment={isProcessingPayment}
                cancellingBookingId={cancellingBookingId}
                onProceedPaymentClicked={onProceedPaymentClicked}
                onBookingCancelledClicked={onBookingCancelledClicked}
                onCancelAndRefundClicked={onCancelAndRefundClicked}
              />
            </div>
          ))}
        </div>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className={className}
      />
    </section>
  );
};

const BookingInfoCard: React.FC<BookingInfoCardProps> = ({
  booking,
  selectedBookingId,
  setSelectedBookingId,
  paymentMethod,
  setPaymentMethod,
  isProcessingPayment,
  cancellingBookingId,
  onProceedPaymentClicked,
  onBookingCancelledClicked,
  onCancelAndRefundClicked,
}) => {
  const isBookingCancellable =
    booking.status !== BookingStatus.CANCELLED &&
    booking.status !== BookingStatus.COMPLETED &&
    booking.status !== BookingStatus.REFUNDED &&
    booking.status !== BookingStatus.NO_SHOW;

  const isBookingInTerminalState =
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.REFUNDED ||
    booking.status === BookingStatus.NO_SHOW;

  const activityName = booking.activitySpot?.name || "Unknown Activity";
  const locationName =
    booking.activitySpot?.location?.name ||
    booking.activitySpot?.location?.city ||
    "Unknown Location";

  const getPaymentStatusElement = () => {
    if (isBookingInTerminalState) {
      return null;
    }

    if (selectedBookingId === booking.id) {
      return null;
    }

    if (booking.paymentStatus === PaymentStatus.PAID) {
      return (
        <span
          className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-1.5 md:py-1 text-xs rounded-sm font-medium"
          style={{
            backgroundColor: "var(--theme-teal)",
            color: "white",
          }}
        >
          ✓ Paid
        </span>
      );
    }

    if (booking.paymentStatus === PaymentStatus.UNPAID) {
      return (
        <button
          disabled={booking.status === BookingStatus.COMPLETED}
          className="w-full sm:w-auto px-3 py-1.5 md:py-1 text-white text-xs rounded-sm font-medium transition-colors theme-btn-teal disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => {
            setSelectedBookingId(selectedBookingId === booking.id ? null : booking.id);
            setPaymentMethod(null);
          }}
        >
          Pay Now
        </button>
      );
    }

    return (
      <span
        className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-1.5 md:py-1 text-xs rounded-sm font-medium theme-text-subtle"
        style={{
          backgroundColor: "var(--theme-card-bg)",
        }}
      >
        {booking.paymentStatus || "Unknown"}
      </span>
    );
  };

  const statusLabel =
    booking.status === BookingStatus.CONFIRMED ? (
      <span className="theme-text font-medium">✓ Confirmed</span>
    ) : booking.status === BookingStatus.PENDING ? (
      <span className="font-medium" style={{ color: "var(--theme-star)" }}>
        ⏳ Pending
      </span>
    ) : booking.status === BookingStatus.COMPLETED ? (
      <span className="font-medium" style={{ color: "var(--theme-teal)" }}>
        ✓ Completed
      </span>
    ) : booking.status === BookingStatus.CANCELLED ? (
      <span className="font-medium" style={{ color: "var(--theme-red)" }}>
        ✗ Cancelled
      </span>
    ) : booking.status === BookingStatus.REFUNDED ? (
      <span className="font-medium theme-text-muted">↩ Refunded</span>
    ) : booking.status === BookingStatus.NO_SHOW ? (
      <span className="theme-text-subtle font-medium">⊘ No Show</span>
    ) : (
      <span className="theme-text-subtle font-medium">{booking.status}</span>
    );

  return (
    <div className="flex flex-col gap-2 md:gap-3 md:flex-row md:items-start md:justify-between min-w-0">
      <div className="flex-1 min-w-0">
        <p className="font-semibold theme-text break-words">{activityName}</p>
        <div className="theme-text-subtle text-sm mt-1 flex flex-col gap-0.5 sm:block">
          <span className="break-words">📍 {locationName}</span>
          <span className="hidden sm:inline"> • </span>
          <span>{formatDate(booking.bookingDate)}</span>
        </div>
        <div className="theme-text-subtle text-xs mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span>
            {booking.participantCount} participant
            {booking.participantCount === 1 ? "" : "s"}
          </span>
          {booking.confirmationCode && (
            <span className="break-all font-mono">{booking.confirmationCode}</span>
          )}
        </div>
      </div>

      <div className="w-full md:w-auto md:min-w-[12rem] md:max-w-sm flex flex-col gap-2 min-w-0">
        {booking.paymentStatus === PaymentStatus.UNPAID && (
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            <div className="text-left sm:text-right min-w-0">
              <p className="font-semibold theme-text text-sm sm:text-base truncate">
                ৳ {booking.totalPrice.toLocaleString()}
              </p>
              <p className="theme-text-subtle text-xs">Cash</p>
            </div>
            <span
              className="shrink-0 inline-block px-2 py-1 text-[10px] sm:text-xs font-bold rounded border"
              style={{
                backgroundColor: "var(--theme-section-bg)",
                color: "var(--theme-teal)",
                borderColor: "var(--theme-teal)",
              }}
            >
              OR
            </span>
            <div className="text-right min-w-0">
              <p className="font-semibold theme-text text-sm sm:text-base truncate">
                💳 {Math.floor(booking.totalPrice * 0.8)}
              </p>
              <p className="theme-text-subtle text-xs">Credits</p>
            </div>
          </div>
        )}

        <p className="theme-text-subtle text-xs text-left sm:text-right">
          Status: {statusLabel}
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:justify-end">
          {getPaymentStatusElement()}

          {isBookingCancellable && selectedBookingId !== booking.id && (
            <button
              disabled={cancellingBookingId === booking.id}
              onClick={() =>
                booking.paymentStatus === PaymentStatus.PAID
                  ? onCancelAndRefundClicked(booking.id)
                  : onBookingCancelledClicked(booking.id)
              }
              className="w-full sm:w-auto px-3 py-1.5 md:py-1 text-white text-xs rounded-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor:
                  booking.paymentStatus === PaymentStatus.PAID
                    ? "var(--theme-teal)"
                    : "var(--theme-red, #dc2626)",
              }}
            >
              {cancellingBookingId === booking.id
                ? "Processing..."
                : booking.paymentStatus === PaymentStatus.PAID
                ? "Cancel & Refund"
                : "Cancel Booking"}
            </button>
          )}
        </div>

        <BookingPostStayActions
          hasServiceStarted={hasBookingServiceStarted(booking.bookingDate)}
          isEligibleBooking={isEligibleForReviewOrComplaint(
            booking.status,
            booking.paymentStatus
          )}
          reviewHref={
            booking.activitySpotId || booking.activitySpot?.id
              ? `/activity-spots/${booking.activitySpotId || booking.activitySpot?.id}`
              : null
          }
          complaintHref={
            booking.activitySpotId || booking.activitySpot?.id
              ? buildComplaintSubmitHref(
                  ComplaintTargetType.ACTIVITY_SPOT,
                  booking.activitySpotId || booking.activitySpot!.id
                )
              : null
          }
        />

        {selectedBookingId === booking.id && (
          <div
            className="mt-1 p-2 md:p-3 rounded-sm text-left w-full border-0 md:border"
            style={{
              backgroundColor: "var(--theme-section-bg)",
              borderColor: "var(--theme-deep-green)",
            }}
          >
            <p className="theme-text text-xs font-semibold mb-3">Select Payment Method</p>
            <div className="space-y-2">
              <label
                className="flex items-start sm:items-center gap-3 p-2 theme-input rounded cursor-pointer transition-colors"
                style={{ borderColor: "var(--theme-teal)" }}
              >
                <input
                  type="radio"
                  name={`activity-history-payment-${booking.id}`}
                  value="wallet"
                  checked={paymentMethod === "wallet"}
                  onChange={() => setPaymentMethod("wallet")}
                  className="w-4 h-4 mt-0.5 sm:mt-0 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="theme-text text-xs font-medium">💰 Wallet</p>
                  <p className="theme-text-subtle text-xs break-words">
                    Pay using your wallet balance
                  </p>
                </div>
              </label>

              <label
                className="flex items-start sm:items-center gap-3 p-2 theme-input rounded cursor-pointer transition-colors"
                style={{ borderColor: "var(--theme-teal)" }}
              >
                <input
                  type="radio"
                  name={`activity-history-payment-${booking.id}`}
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="w-4 h-4 mt-0.5 sm:mt-0 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="theme-text text-xs font-medium">💳 Card</p>
                  <p className="theme-text-subtle text-xs break-words">
                    Pay using credit or debit card
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-3 flex flex-col-reverse sm:flex-row gap-2">
              <button
                onClick={() => {
                  setSelectedBookingId(null);
                  setPaymentMethod(null);
                }}
                disabled={isProcessingPayment}
                className="w-full sm:w-auto px-3 py-2 text-xs rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed theme-text"
                style={{
                  backgroundColor: "var(--theme-card-bg)",
                  borderColor: "var(--theme-deep-green)",
                }}
              >
                Close
              </button>

              <button
                disabled={!paymentMethod || isProcessingPayment}
                onClick={() => onProceedPaymentClicked(booking)}
                className="w-full sm:flex-1 px-3 py-2 theme-btn-teal text-white text-xs rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? "Processing..." : "Proceed Payment"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
