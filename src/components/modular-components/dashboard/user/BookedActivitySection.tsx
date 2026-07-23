"use client";

import React, { useState } from "react";
import { PaymentApi, WalletApi, ActivitySpotBookingApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { ServiceType, PaymentStatus, BookingStatus } from "@/types/enums";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { PlaceholderFeatureWarning } from "@/components/placeholder-components/FeatureUnderDevelopment";

function formatDate(value?: Date | string | null): string {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getActivitySpotName(booking: ActivityBooking): string {
  return booking.activitySpot?.name || "Unknown Activity";
}

function getActivityLocation(booking: ActivityBooking): string {
  return (
    booking.activitySpot?.location?.name ||
    booking.activitySpot?.location?.city ||
    "Unknown Location"
  );
}

// Booked Activities Section
export const BookedActivitySection: React.FC<{
  activities: ActivityBooking[];
  userId?: string;
  className?: string;
  showFakeData?: boolean;
}> = ({ activities, userId, className, showFakeData = false }) => {
  const [payingId, setPayingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card" | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
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

  const { mutate: cancelBookingMutation } =
    ActivitySpotBookingApi.useCancelActivityBookingRQ(
      (responseData) => {
        setCancellingId(null);
        if (responseData.status === "success") {
          queryClient.invalidateQueries({ queryKey: ["activityBookings"] });
          openNotificationPopUpMessage(
            responseData.message || "Activity booking cancelled"
          );
        } else {
          openNotificationPopUpMessage(
            responseData.message || "Failed to cancel activity booking"
          );
        }
      },
      (error) => {
        setCancellingId(null);
        openNotificationPopUpMessage(
          error?.message || "Failed to cancel activity booking"
        );
      }
    );

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

  const onCancelBookingClicked = (booking: ActivityBooking) => {
    if (booking.paymentStatus === PaymentStatus.PAID) {
      openNotificationPopUpMessage("Cancel and refund feature coming soon");
      return;
    }

    setCancellingId(booking.id);
    cancelBookingMutation({ bookingId: booking.id });
  };

  const confirmedActivities =
    activities?.filter((a) => a.status === BookingStatus.CONFIRMED) || [];
  const upcomingActivities =
    activities?.filter((a) => a.status === BookingStatus.PENDING) || [];

  const renderBookingCard = (booking: ActivityBooking) => {
    const canPay = booking.paymentStatus === PaymentStatus.UNPAID;
    const canCancel =
      booking.status === BookingStatus.PENDING ||
      booking.status === BookingStatus.CONFIRMED;

    return (
      <div
        key={booking.id}
        className="rounded-sm md:rounded p-2 md:p-3 overflow-hidden transition-colors border-0 md:border"
        style={{
          backgroundColor: "var(--theme-bg)",
          borderColor: "var(--theme-deep-green)",
        }}
      >
        <div className="flex flex-col gap-2 md:gap-3 md:flex-row md:items-start md:justify-between min-w-0">
          <div className="flex-1 min-w-0">
            <p
              className="font-medium break-words"
              style={{ color: "var(--theme-text)" }}
            >
              {getActivitySpotName(booking)}
            </p>
            <div
              className="text-sm mt-1 flex flex-col gap-0.5 sm:block"
              style={{ color: "var(--theme-text-subtle)" }}
            >
              <span className="break-words">{getActivityLocation(booking)}</span>
              <span className="hidden sm:inline"> • </span>
              <span>{formatDate(booking.bookingDate)}</span>
            </div>
            <div
              className="text-xs mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5"
              style={{ color: "var(--theme-text-subtle)" }}
            >
              <span>
                {booking.participantCount} participant
                {booking.participantCount === 1 ? "" : "s"}
              </span>
              {booking.confirmationCode && (
                <span className="break-all font-mono">{booking.confirmationCode}</span>
              )}
            </div>
            {booking.activitySpot?.activityType && (
              <p className="text-xs mt-1" style={{ color: "var(--theme-text-subtle)" }}>
                {booking.activitySpot.activityType.replace(/_/g, " ")}
              </p>
            )}
          </div>

          <div className="w-full md:w-auto md:min-w-[12rem] md:max-w-sm flex flex-col gap-2 min-w-0">
            {booking.paymentStatus === PaymentStatus.UNPAID && (
              <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
                <div className="text-left sm:text-right min-w-0">
                  <p
                    className="font-semibold text-sm sm:text-base truncate"
                    style={{ color: "var(--theme-text)" }}
                  >
                    ৳ {booking.totalPrice.toLocaleString()}
                  </p>
                  <p className="text-xs" style={{ color: "var(--theme-text-subtle)" }}>
                    Cash
                  </p>
                </div>
                <span
                  className="shrink-0 inline-block px-2 py-1 text-[10px] sm:text-xs font-bold rounded border"
                  style={{
                    backgroundColor: "rgba(42, 157, 143, 0.2)",
                    color: "var(--theme-teal)",
                    borderColor: "var(--theme-teal)",
                  }}
                >
                  OR
                </span>
                <div className="text-right min-w-0">
                  <p
                    className="font-semibold text-sm sm:text-base truncate"
                    style={{ color: "var(--theme-text)" }}
                  >
                    💳 {Math.floor(booking.totalPrice * 0.8)}
                  </p>
                  <p className="text-xs" style={{ color: "var(--theme-text-subtle)" }}>
                    Credits
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:justify-end">
              {booking.paymentStatus === PaymentStatus.PAID ? (
                <span
                  className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 sm:py-1 text-xs rounded font-medium"
                  style={{
                    backgroundColor: "rgba(42, 157, 143, 0.2)",
                    color: "var(--theme-teal)",
                  }}
                >
                  Paid
                </span>
              ) : canPay ? (
                <button
                  className="w-full sm:w-auto px-3 py-2 sm:py-1 text-white text-xs rounded font-medium transition-colors hover:cursor-pointer"
                  style={{ backgroundColor: "var(--theme-teal)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--theme-teal-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--theme-teal)")
                  }
                  onClick={() => {
                    setPayingId(payingId === booking.id ? null : booking.id);
                    setPaymentMethod(null);
                  }}
                >
                  Pay Now
                </button>
              ) : null}

              {canCancel && (
                <button
                  disabled={cancellingId === booking.id}
                  className="w-full sm:w-auto px-3 py-2 sm:py-1 text-white text-xs rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor:
                      booking.paymentStatus === PaymentStatus.PAID
                        ? "var(--theme-teal)"
                        : "#DC2626",
                  }}
                  onMouseEnter={(e) => {
                    if (booking.paymentStatus === PaymentStatus.PAID) {
                      e.currentTarget.style.backgroundColor = "var(--theme-teal-hover)";
                    } else {
                      e.currentTarget.style.backgroundColor = "#B91C1C";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (booking.paymentStatus === PaymentStatus.PAID) {
                      e.currentTarget.style.backgroundColor = "var(--theme-teal)";
                    } else {
                      e.currentTarget.style.backgroundColor = "#DC2626";
                    }
                  }}
                  onClick={() => onCancelBookingClicked(booking)}
                >
                  {cancellingId === booking.id
                    ? "Cancelling..."
                    : booking.paymentStatus === PaymentStatus.PAID
                    ? "Cancel & Refund"
                    : "Cancel Booking"}
                </button>
              )}
            </div>

            {payingId === booking.id && canPay && (
              <div
                className="mt-1 p-2 md:p-3 border-0 md:border rounded-sm text-left w-full"
                style={{
                  backgroundColor: "var(--theme-section-bg)",
                  borderColor: "var(--theme-deep-green)",
                }}
              >
                <p
                  className="text-xs font-semibold mb-3"
                  style={{ color: "var(--theme-text)" }}
                >
                  Select Payment Method
                </p>
                <div className="space-y-2">
                  <label
                    className="flex items-start sm:items-center gap-3 p-2 rounded border cursor-pointer transition-colors"
                    style={{
                      backgroundColor: "var(--theme-card-bg)",
                      borderColor: "var(--theme-deep-green)",
                    }}
                  >
                    <input
                      type="radio"
                      name={`activity-payment-${booking.id}`}
                      value="wallet"
                      checked={paymentMethod === "wallet"}
                      onChange={() => setPaymentMethod("wallet")}
                      className="w-4 h-4 mt-0.5 sm:mt-0 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-medium"
                        style={{ color: "var(--theme-text)" }}
                      >
                        💰 Wallet
                      </p>
                      <p
                        className="text-xs break-words"
                        style={{ color: "var(--theme-text-subtle)" }}
                      >
                        Pay using your wallet balance
                      </p>
                    </div>
                  </label>

                  <label
                    className="flex items-start sm:items-center gap-3 p-2 rounded border cursor-pointer transition-colors"
                    style={{
                      backgroundColor: "var(--theme-card-bg)",
                      borderColor: "var(--theme-deep-green)",
                    }}
                  >
                    <input
                      type="radio"
                      name={`activity-payment-${booking.id}`}
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="w-4 h-4 mt-0.5 sm:mt-0 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-medium"
                        style={{ color: "var(--theme-text)" }}
                      >
                        💳 Card
                      </p>
                      <p
                        className="text-xs break-words"
                        style={{ color: "var(--theme-text-subtle)" }}
                      >
                        Pay using credit or debit card
                      </p>
                    </div>
                  </label>
                </div>

                <div className="mt-3 flex flex-col-reverse sm:flex-row gap-2">
                  <button
                    onClick={() => {
                      setPayingId(null);
                      setPaymentMethod(null);
                    }}
                    disabled={isProcessingPayment}
                    className="w-full sm:w-auto px-3 py-2 text-white text-xs rounded font-medium transition-colors disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: isProcessingPayment
                        ? "var(--theme-text-subtle)"
                        : "var(--theme-deep-green)",
                    }}
                  >
                    Close
                  </button>
                  <button
                    disabled={!paymentMethod || isProcessingPayment}
                    onClick={() => onProceedPaymentClicked(booking)}
                    className="w-full sm:flex-1 px-3 py-2 text-white text-xs rounded font-medium transition-colors disabled:cursor-not-allowed"
                    style={{
                      backgroundColor:
                        !paymentMethod || isProcessingPayment
                          ? "var(--theme-text-subtle)"
                          : "var(--theme-teal)",
                    }}
                  >
                    {isProcessingPayment ? "Processing..." : "Proceed Payment"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={`mb-0 ${className || ""}`}>
      <div
        className="mb-3 md:mb-4 pb-2 md:pb-3 border-b-0 md:border-b"
        style={{ borderColor: "var(--theme-deep-green)" }}
      >
        <h2 className="text-xl sm:text-2xl font-bold theme-text-teal">
          Booked Activities
        </h2>
      </div>

      {showFakeData && (
        <PlaceholderFeatureWarning moduleName="Booked Activity Details" />
      )}

      {confirmedActivities.length === 0 && upcomingActivities.length === 0 ? (
        <div className="rounded-sm p-4 text-center theme-text-subtle">
          No booked activities
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {confirmedActivities.length > 0 && (
            <div>
              <h3
                className="text-base md:text-lg font-semibold mb-2 md:mb-3"
                style={{ color: "var(--theme-teal)" }}
              >
                🔴 Confirmed Activities
              </h3>
              <div
                className="rounded-sm md:rounded-md overflow-y-auto max-h-[80vh] min-h-[40vh] px-0 py-2 md:p-2 border-0 md:border"
                style={{
                  backgroundColor: "var(--theme-card-bg)",
                  borderColor: "var(--theme-deep-green)",
                }}
              >
                <div className="space-y-2">
                  {confirmedActivities.map(renderBookingCard)}
                </div>
              </div>
            </div>
          )}

          {upcomingActivities.length > 0 && (
            <div>
              <h3
                className="text-base md:text-lg font-semibold mb-2 md:mb-3"
                style={{ color: "var(--theme-teal)" }}
              >
                📅 Upcoming Activities
              </h3>
              <div
                className="rounded-sm md:rounded-md overflow-y-auto max-h-[80vh] min-h-[40vh] px-0 py-2 md:p-2 border-0 md:border"
                style={{
                  backgroundColor: "var(--theme-card-bg)",
                  borderColor: "var(--theme-deep-green)",
                }}
              >
                <div className="space-y-2">
                  {upcomingActivities.map(renderBookingCard)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
