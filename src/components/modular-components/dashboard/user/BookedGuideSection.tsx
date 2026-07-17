"use client";

import React, { useState } from "react";
import { PaymentApi, WalletApi, GuideBookingApi } from "@/services/api";
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

// Booked Guides Section
export const BookedGuideSection: React.FC<{
  guides: GuideBooking[];
  userId?: string;
  className?: string;
  showFakeData?: boolean;
}> = ({ guides, userId, className, showFakeData = false }) => {
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
        queryClient.invalidateQueries({ queryKey: ["guideBookings"] });
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

  const { mutate: cancelBookingMutation } = GuideBookingApi.useUpdateGuideBookingStatusRQ(
    (responseData) => {
      setCancellingId(null);
      if (responseData.status === "success") {
        queryClient.invalidateQueries({ queryKey: ["guideBookings"] });
        openNotificationPopUpMessage(
          responseData.message || "Guide booking cancelled"
        );
      } else {
        openNotificationPopUpMessage(
          responseData.message || "Failed to cancel guide booking"
        );
      }
    },
    (error) => {
      setCancellingId(null);
      openNotificationPopUpMessage(
        error?.message || "Failed to cancel guide booking"
      );
    }
  );

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

  const onCancelBookingClicked = (booking: GuideBooking) => {
    if (booking.paymentStatus === PaymentStatus.PAID) {
      openNotificationPopUpMessage("Cancel and refund feature coming soon");
      return;
    }

    setCancellingId(booking.id);
    cancelBookingMutation({
      bookingId: booking.id,
      data: { action: "cancel" },
    });
  };

  // Confirmed = paid & locked in; Accepted/Pending = awaiting payment or guide response
  const confirmedGuides =
    guides?.filter((g) => g.status === BookingStatus.CONFIRMED) || [];
  const upcomingGuides =
    guides?.filter(
      (g) =>
        g.status === BookingStatus.ACCEPTED || g.status === BookingStatus.PENDING
    ) || [];

  const renderBookingCard = (booking: GuideBooking) => {
    const canPay =
      booking.status === BookingStatus.ACCEPTED &&
      booking.paymentStatus === PaymentStatus.UNPAID;
    const canCancel =
      booking.status === BookingStatus.PENDING ||
      booking.status === BookingStatus.ACCEPTED;

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
              {getGuideDisplayName(booking)}
            </p>
            <div
              className="text-sm mt-1 flex flex-col gap-0.5 sm:block"
              style={{ color: "var(--theme-text-subtle)" }}
            >
              <span className="break-words">{getGuideLocation(booking)}</span>
              <span className="hidden sm:inline"> • </span>
              <span className="break-words">{getScheduleLabel(booking)}</span>
            </div>
            <div
              className="text-xs mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5"
              style={{ color: "var(--theme-text-subtle)" }}
            >
              <span>
                {booking.travelerCount} traveler
                {booking.travelerCount === 1 ? "" : "s"}
              </span>
              {booking.confirmationCode && (
                <span className="break-all font-mono">{booking.confirmationCode}</span>
              )}
            </div>
            <p
              className="text-xs mt-1 font-medium"
              style={{ color: "var(--theme-teal)" }}
            >
              Status: {booking.status}
            </p>
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
              ) : booking.status === BookingStatus.PENDING ? (
                <span
                  className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 sm:py-1 text-xs rounded font-medium"
                  style={{
                    backgroundColor: "rgba(234, 179, 8, 0.2)",
                    color: "var(--theme-star)",
                  }}
                >
                  Awaiting Guide
                </span>
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
                {booking.paymentExpiresAt && (
                  <p
                    className="text-xs mb-2 break-words"
                    style={{ color: "var(--theme-text-subtle)" }}
                  >
                    Pay by {formatDate(booking.paymentExpiresAt)}{" "}
                    {formatTime(booking.paymentExpiresAt) || ""}
                  </p>
                )}
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
                      name={`guide-payment-${booking.id}`}
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
                      name={`guide-payment-${booking.id}`}
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
    <section className={`mb-0 ${className || ""}`} id="booked_guides_section">
      <div
        className="mb-3 md:mb-4 pb-2 md:pb-3 border-b-0 md:border-b"
        style={{ borderColor: "var(--theme-deep-green)" }}
      >
        <h2 className="text-xl sm:text-2xl font-bold theme-text-teal">
          Booked Guides
        </h2>
      </div>

      {showFakeData && (
        <PlaceholderFeatureWarning moduleName="Booked Guide Details" />
      )}

      {confirmedGuides.length === 0 && upcomingGuides.length === 0 ? (
        <div className="rounded-sm p-4 text-center theme-text-subtle">
          No booked guides
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {confirmedGuides.length > 0 && (
            <div>
              <h3
                className="text-base md:text-lg font-semibold mb-2 md:mb-3"
                style={{ color: "var(--theme-teal)" }}
              >
                🔴 Confirmed Tours
              </h3>
              <div
                className="rounded-sm md:rounded-md overflow-y-auto max-h-[80vh] min-h-[40vh] px-0 py-2 md:p-2 border-0 md:border"
                style={{
                  backgroundColor: "var(--theme-card-bg)",
                  borderColor: "var(--theme-deep-green)",
                }}
              >
                <div className="space-y-2">
                  {confirmedGuides.map(renderBookingCard)}
                </div>
              </div>
            </div>
          )}

          {upcomingGuides.length > 0 && (
            <div>
              <h3
                className="text-base md:text-lg font-semibold mb-2 md:mb-3"
                style={{ color: "var(--theme-teal)" }}
              >
                📅 Upcoming / Awaiting
              </h3>
              <div
                className="rounded-sm md:rounded-md overflow-y-auto max-h-[80vh] min-h-[40vh] px-0 py-2 md:p-2 border-0 md:border"
                style={{
                  backgroundColor: "var(--theme-card-bg)",
                  borderColor: "var(--theme-deep-green)",
                }}
              >
                <div className="space-y-2">
                  {upcomingGuides.map(renderBookingCard)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
