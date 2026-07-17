"use client";

import React, { useState, useMemo } from "react";
import { PaginationControls } from "./PaginationControls";
import { GuideBookingApi, PaymentApi, WalletApi } from "@/services/api";
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

function formatTime(value?: Date | string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getGuideDisplayName(booking: GuideBooking): string {
  const guide = booking.guide;
  if (!guide) return "Unknown Guide";
  const name = `${guide.firstName || ""} ${guide.lastName || ""}`.trim();
  return name || "Unknown Guide";
}

function getGuideLocation(booking: GuideBooking): string {
  return booking.guide?.location?.name || "Unknown Location";
}

function getScheduleLabel(booking: GuideBooking): string {
  const date = formatDate(booking.bookingDate);
  const start = formatTime(booking.startTime);
  const end = formatTime(booking.endTime);

  if (start && end) return `${date} • ${start} – ${end}`;
  if (end) return `${date} • until ${end}`;
  return date;
}

interface BookingInfoCardProps {
  booking: GuideBooking;
  selectedBookingId: string | null;
  setSelectedBookingId: (id: string | null) => void;
  paymentMethod: "wallet" | "card" | null;
  setPaymentMethod: (method: "wallet" | "card" | null) => void;
  isProcessingPayment: boolean;
  cancellingBookingId: string | null;
  onProceedPaymentClicked: (booking: GuideBooking) => void;
  onBookingCancelledClicked: (bookingId: string) => void;
  onCancelAndRefundClicked: (bookingId: string) => void;
}

// Guide Booking History with Pagination
export const GuideBookingHistorySection: React.FC<{
  bookings?: GuideBooking[];
  userId?: string;
  itemsPerPage?: number;
  className?: string;
  showFakeData?: boolean;
}> = ({ bookings: propBookings, userId, itemsPerPage = 5, className, showFakeData = false }) => {
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
        queryClient.invalidateQueries({ queryKey: ["guideBookings"] });
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

  const { data: bookingsResponse, isLoading, refetch } = GuideBookingApi.useGetGuideBookingsRQ(
    userId ? `userId=${userId}` : undefined
  );

  const { mutate: cancelBookingMutation } = GuideBookingApi.useUpdateGuideBookingStatusRQ(
    (responseData) => {
      setCancellingBookingId(null);
      if (responseData.status === "success") {
        openNotificationPopUpMessage(responseData.message || "Guide booking cancelled");
        queryClient.invalidateQueries({ queryKey: ["guideBookings"] });
        refetch();
      } else {
        openNotificationPopUpMessage(responseData.message || "Failed to cancel guide booking");
      }
    },
    (error) => {
      setCancellingBookingId(null);
      openNotificationPopUpMessage(error?.message || "Failed to cancel guide booking");
    }
  );

  const bookings = useMemo(() => {
    if (propBookings && propBookings.length > 0) {
      return propBookings;
    }

    if (!bookingsResponse?.data) {
      return [];
    }

    return Array.isArray(bookingsResponse.data)
      ? bookingsResponse.data
      : bookingsResponse.data.results || [];
  }, [propBookings, bookingsResponse?.data]);

  const onProceedPaymentClicked = (booking: GuideBooking) => {
    if (!paymentMethod) return;

    setIsProcessingPayment(true);

    if (paymentMethod === "card") {
      initializePaymentMutation({
        serviceType: ServiceType.GUIDE_SERVICE,
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
        serviceType: ServiceType.GUIDE_SERVICE,
        serviceTypeId: booking.id,
        paymentAmount: creditsAmount,
      });
    }
  };

  const onBookingCancelledClicked = (bookingId: string) => {
    setCancellingBookingId(bookingId);
    setSelectedBookingId(null);
    setPaymentMethod(null);
    cancelBookingMutation({
      bookingId,
      data: { action: "cancel" },
    });
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
        Guide Booking History
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
          <PlaceholderFeatureWarning moduleName="Guide Booking History Details" />
        )}
        <div className="rounded-sm p-4 text-center theme-text-subtle">
          No guide bookings found
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
        <PlaceholderFeatureWarning moduleName="Guide Booking History Details" />
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
  // Traveler may cancel only while PENDING or ACCEPTED (guide booking rules)
  const isBookingCancellable =
    booking.status === BookingStatus.PENDING ||
    booking.status === BookingStatus.ACCEPTED;

  const isBookingInTerminalState =
    booking.status === BookingStatus.CANCELLED ||
    booking.status === BookingStatus.DECLINED ||
    booking.status === BookingStatus.COMPLETED ||
    booking.status === BookingStatus.REFUNDED ||
    booking.status === BookingStatus.NO_SHOW;

  const canPay =
    booking.status === BookingStatus.ACCEPTED &&
    booking.paymentStatus === PaymentStatus.UNPAID;

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

    if (canPay) {
      return (
        <button
          className="w-full sm:w-auto px-3 py-1.5 md:py-1 text-white text-xs rounded-sm font-medium transition-colors theme-btn-teal"
          onClick={() => {
            setSelectedBookingId(selectedBookingId === booking.id ? null : booking.id);
            setPaymentMethod(null);
          }}
        >
          Pay Now
        </button>
      );
    }

    if (booking.status === BookingStatus.PENDING) {
      return (
        <span
          className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-1.5 md:py-1 text-xs rounded-sm font-medium"
          style={{
            backgroundColor: "rgba(234, 179, 8, 0.2)",
            color: "var(--theme-star)",
          }}
        >
          Awaiting Guide
        </span>
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

  const getStatusLabel = () => {
    switch (booking.status) {
      case BookingStatus.CONFIRMED:
        return <span className="theme-text font-medium">✓ Confirmed</span>;
      case BookingStatus.ACCEPTED:
        return (
          <span className="font-medium" style={{ color: "var(--theme-teal)" }}>
            ✓ Accepted — pay to confirm
          </span>
        );
      case BookingStatus.PENDING:
        return (
          <span className="font-medium" style={{ color: "var(--theme-star)" }}>
            ⏳ Pending
          </span>
        );
      case BookingStatus.COMPLETED:
        return (
          <span className="font-medium" style={{ color: "var(--theme-teal)" }}>
            ✓ Completed
          </span>
        );
      case BookingStatus.DECLINED:
        return (
          <span className="font-medium" style={{ color: "var(--theme-red, #dc2626)" }}>
            ✗ Declined
          </span>
        );
      case BookingStatus.CANCELLED:
        return (
          <span className="font-medium" style={{ color: "var(--theme-red, #dc2626)" }}>
            ✗ Cancelled
          </span>
        );
      case BookingStatus.REFUNDED:
        return <span className="font-medium theme-text-muted">↩ Refunded</span>;
      case BookingStatus.NO_SHOW:
        return <span className="theme-text-subtle font-medium">⊘ No Show</span>;
      default:
        return <span className="theme-text-subtle font-medium">{booking.status}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-2 md:gap-3 md:flex-row md:items-start md:justify-between min-w-0">
      <div className="flex-1 min-w-0">
        <p className="font-semibold theme-text break-words">{getGuideDisplayName(booking)}</p>
        <div className="theme-text-subtle text-sm mt-1 flex flex-col gap-0.5 sm:block">
          <span className="break-words">📍 {getGuideLocation(booking)}</span>
          <span className="hidden sm:inline"> • </span>
          <span className="break-words">{getScheduleLabel(booking)}</span>
        </div>
        <div className="theme-text-subtle text-xs mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span>
            {booking.travelerCount} traveler
            {booking.travelerCount === 1 ? "" : "s"}
          </span>
          {booking.confirmationCode && (
            <span className="break-all font-mono">{booking.confirmationCode}</span>
          )}
        </div>
        {booking.declinedReason && booking.status === BookingStatus.DECLINED && (
          <p className="text-xs mt-1 break-words" style={{ color: "var(--theme-red, #dc2626)" }}>
            Reason: {booking.declinedReason}
          </p>
        )}
        {booking.cancellationReason && booking.status === BookingStatus.CANCELLED && (
          <p className="theme-text-subtle text-xs mt-1 break-words">
            Reason: {booking.cancellationReason}
          </p>
        )}
      </div>

      <div className="w-full md:w-auto md:min-w-[12rem] md:max-w-sm flex flex-col gap-2 min-w-0">
        {booking.paymentStatus === PaymentStatus.UNPAID && !isBookingInTerminalState && (
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
          Status: {getStatusLabel()}
        </p>

        {booking.paymentExpiresAt && canPay && (
          <p className="theme-text-subtle text-xs text-left sm:text-right break-words">
            Pay by {formatDate(booking.paymentExpiresAt)}{" "}
            {formatTime(booking.paymentExpiresAt) || ""}
          </p>
        )}

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
          hasServiceStarted={hasBookingServiceStarted(
            booking.startTime || booking.bookingDate
          )}
          isEligibleBooking={isEligibleForReviewOrComplaint(
            booking.status,
            booking.paymentStatus
          )}
          reviewHref={
            booking.guideId || booking.guide?.id
              ? `/guides/${booking.guideId || booking.guide?.id}`
              : null
          }
          complaintHref={
            booking.guideId || booking.guide?.id
              ? buildComplaintSubmitHref(
                  ComplaintTargetType.GUIDE,
                  booking.guideId || booking.guide!.id
                )
              : null
          }
        />

        {selectedBookingId === booking.id && canPay && (
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
                  name={`guide-history-payment-${booking.id}`}
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
                  name={`guide-history-payment-${booking.id}`}
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
