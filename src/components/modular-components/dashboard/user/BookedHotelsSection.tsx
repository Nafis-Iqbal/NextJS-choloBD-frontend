import React, { useState } from "react";
import { PaymentApi, WalletApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { ServiceType, PaymentStatus } from "@/types/enums";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";
import { PlaceholderFeatureWarning } from "@/components/placeholder-components/FeatureUnderDevelopment";

function formatDate(value: Date | string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

// Booked Hotels Section
export const BookedHotelsSection: React.FC<{
  hotels: HotelRoomBooking[];
  userId?: string;
  className?: string;
  showFakeData?: boolean;
}> = ({ hotels, userId, className, showFakeData = false }) => {
  const [payingId, setPayingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card" | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
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
        queryClient.invalidateQueries({ queryKey: ["hotelBookings"] });
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

  const onProceedPaymentClicked = (hotel: HotelRoomBooking) => {
    if (!paymentMethod) return;

    setIsProcessingPayment(true);

    if (paymentMethod === "card") {
      initializePaymentMutation({
        serviceType: ServiceType.HOTEL_BOOKING,
        serviceTypeId: hotel.id,
        userId: userId,
        userName: hotel.guestName || undefined,
        phone: hotel.guestPhoneNumber || undefined,
        email: hotel.guestEmail || undefined,
        paymentAmount: hotel.totalPrice,
      });
    } else if (paymentMethod === "wallet") {
      const creditsAmount = Math.floor(hotel.totalPrice * 0.8);
      chargeWalletMutation({
        serviceType: ServiceType.HOTEL_BOOKING,
        serviceTypeId: hotel.id,
        paymentAmount: creditsAmount,
      });
    }
  };

  const ongoingHotels = hotels?.filter((h) => h.status === "CONFIRMED") || [];
  const upcomingHotels = hotels?.filter((h) => h.status === "PENDING") || [];

  const renderBookingCard = (hotel: HotelRoomBooking) => (
    <div
      key={hotel.id}
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
            {hotel.hotel?.name || "Unknown Hotel"}
          </p>
          <div
            className="text-sm mt-1 flex flex-col gap-0.5 sm:block"
            style={{ color: "var(--theme-text-subtle)" }}
          >
            <span className="break-words">
              {hotel.hotel?.location?.name || "Unknown City"}
            </span>
            <span className="hidden sm:inline"> • </span>
            <span>
              {formatDate(hotel.checkInDate)} to {formatDate(hotel.checkOutDate)}
            </span>
          </div>
        </div>

        <div className="w-full md:w-auto md:min-w-[12rem] md:max-w-sm flex flex-col gap-2 min-w-0">
          {hotel.paymentStatus === PaymentStatus.UNPAID && (
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
              <div className="text-left sm:text-right min-w-0">
                <p
                  className="font-semibold text-sm sm:text-base truncate"
                  style={{ color: "var(--theme-text)" }}
                >
                  ৳ {hotel.totalPrice.toLocaleString()}
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
                  💳 {Math.floor(hotel.totalPrice * 0.8)}
                </p>
                <p className="text-xs" style={{ color: "var(--theme-text-subtle)" }}>
                  Credits
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:justify-end">
            {hotel.paymentStatus === PaymentStatus.PAID ? (
              <span
                className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 sm:py-1 text-xs rounded font-medium"
                style={{
                  backgroundColor: "rgba(42, 157, 143, 0.2)",
                  color: "var(--theme-teal)",
                }}
              >
                Paid
              </span>
            ) : (
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
                  setPayingId(payingId === hotel.id ? null : hotel.id);
                  setPaymentMethod(null);
                }}
              >
                Pay Now
              </button>
            )}

            <button
              className="w-full sm:w-auto px-3 py-2 sm:py-1 text-white text-xs rounded font-medium transition-colors"
              style={{
                backgroundColor:
                  hotel.paymentStatus === PaymentStatus.PAID
                    ? "var(--theme-teal)"
                    : "#DC2626",
              }}
              onMouseEnter={(e) => {
                if (hotel.paymentStatus === PaymentStatus.PAID) {
                  e.currentTarget.style.backgroundColor = "var(--theme-teal-hover)";
                } else {
                  e.currentTarget.style.backgroundColor = "#B91C1C";
                }
              }}
              onMouseLeave={(e) => {
                if (hotel.paymentStatus === PaymentStatus.PAID) {
                  e.currentTarget.style.backgroundColor = "var(--theme-teal)";
                } else {
                  e.currentTarget.style.backgroundColor = "#DC2626";
                }
              }}
            >
              {hotel.paymentStatus === PaymentStatus.PAID
                ? "Cancel & Refund"
                : "Cancel Booking"}
            </button>
          </div>

          {payingId === hotel.id && (
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
                    name={`booked-payment-${hotel.id}`}
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
                    name={`booked-payment-${hotel.id}`}
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
                  onClick={() => onProceedPaymentClicked(hotel)}
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

  return (
    <section className={`mb-0 ${className || ""}`}>
      <div
        className="mb-3 md:mb-4 pb-2 md:pb-3 border-b-0 md:border-b"
        style={{ borderColor: "var(--theme-deep-green)" }}
      >
        <h2 className="text-xl sm:text-2xl font-bold theme-text-teal">
          Booked Hotels
        </h2>
      </div>
      {showFakeData && (
        <PlaceholderFeatureWarning moduleName="Booked Hotels Details" />
      )}
      {ongoingHotels.length === 0 && upcomingHotels.length === 0 ? (
        <div className="rounded-sm p-4 text-center theme-text-subtle">
          No booked hotels
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {ongoingHotels.length > 0 && (
            <div>
              <h3
                className="text-base md:text-lg font-semibold mb-2 md:mb-3"
                style={{ color: "var(--theme-teal)" }}
              >
                🔴 Current Stay
              </h3>
              <div
                className="rounded-sm md:rounded-md overflow-y-auto max-h-[80vh] min-h-[40vh] px-0 py-2 md:p-2 border-0 md:border"
                style={{
                  backgroundColor: "var(--theme-card-bg)",
                  borderColor: "var(--theme-deep-green)",
                }}
              >
                <div className="space-y-2">{ongoingHotels.map(renderBookingCard)}</div>
              </div>
            </div>
          )}
          {upcomingHotels.length > 0 && (
            <div>
              <h3
                className="text-base md:text-lg font-semibold mb-2 md:mb-3"
                style={{ color: "var(--theme-teal)" }}
              >
                📅 Upcoming Stays
              </h3>
              <div
                className="rounded-sm md:rounded-md overflow-y-auto max-h-[80vh] min-h-[40vh] px-0 py-2 md:p-2 border-0 md:border"
                style={{
                  backgroundColor: "var(--theme-card-bg)",
                  borderColor: "var(--theme-deep-green)",
                }}
              >
                <div className="space-y-2">{upcomingHotels.map(renderBookingCard)}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
