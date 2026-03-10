import React, { useState } from "react";
import { PaymentApi, WalletApi, HotelBookingApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { ServiceType, PaymentStatus } from "@/types/enums";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";

// Booked Hotels Section
export const BookedHotelsSection: React.FC<{
  hotels: HotelRoomBooking[];
  userId?: string;
  className?: string;
}> = ({ hotels, userId, className }) => {
  const [payingId, setPayingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card" | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { openNotificationPopUpMessage } = useGlobalUI();

  // Initialize payment mutation
  const { mutate: initializePaymentMutation } = PaymentApi.useInitializePaymentRQ(
    (responseData) => {
      setIsProcessingPayment(false);
      
      if (responseData.status === "success" && responseData.data?.gatewayPageURL) {
        // Redirect to payment gateway for card payment
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

  // Charge wallet credits mutation
  const { mutate: chargeWalletMutation } = WalletApi.useChargeWalletCreditsRQ(
    (responseData) => {
      setIsProcessingPayment(false);
      if (responseData.status === "success") {
        queryClient.invalidateQueries({queryKey:["myWallet"]});
        queryClient.invalidateQueries({queryKey:["hotelBookings"]});
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
      // Initialize payment for card payment
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
      // Charge wallet credits for wallet payment
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

  return (
    <section className={`mb-8 ${className || ''}`} id="booked_hotels_section">
      <h2 className="text-2xl font-bold text-white mb-4">Booked Hotels</h2>
      {ongoingHotels.length === 0 && upcomingHotels.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center text-gray-400">
          No booked hotels
        </div>
      ) : (
        <div className="space-y-6">
          {ongoingHotels.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-orange-400 mb-3">
                🔴 Current Stay
              </h3>
              <div className="space-y-2">
                {ongoingHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex items-center justify-between hover:border-orange-600 transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">{hotel.hotel?.name || "Unknown Hotel"}</p>
                      <p className="text-gray-400 text-sm">
                        {hotel.hotel?.location?.name || "Unknown City"} • {new Date(hotel.checkInDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })} to {new Date(hotel.checkOutDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex flex-col text-right">
                        {hotel.paymentStatus === PaymentStatus.UNPAID && (
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-white font-semibold">৳ {hotel.totalPrice.toLocaleString()}</p>
                              <p className="text-gray-500 text-xs">Cash</p>
                            </div>
                            <div className="text-center">
                              <span className="inline-block px-2 py-1 bg-blue-600/30 text-blue-400 text-xs font-bold rounded border border-blue-600">OR</span>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">💳 {Math.floor(hotel.totalPrice * 0.8)}</p>
                              <p className="text-gray-500 text-xs">Credits</p>
                            </div>
                          </div>
                        )}
                        <div className="mt-2 flex gap-2">
                            {hotel.paymentStatus === PaymentStatus.PAID ? (
                            <span className="px-3 py-1 bg-green-600/30 text-green-400 text-xs rounded font-medium">
                                Paid
                            </span>
                            ) : (
                            <button 
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-medium transition-colors"
                                onClick={() => {
                                  setPayingId(payingId === hotel.id ? null : hotel.id);
                                  setPaymentMethod(null);
                                }}
                            >
                                Pay Now
                            </button>
                            )}

                            <button className={`px-3 py-1 text-white text-xs rounded font-medium transition-colors ${
                              hotel.paymentStatus === PaymentStatus.PAID
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-red-600 hover:bg-red-700"
                            }`}>
                                {hotel.paymentStatus === PaymentStatus.PAID ? "Cancel & Refund" : "Cancel Booking"}
                            </button>
                        </div>

                        {payingId === hotel.id && (
                            <div className="mt-3 p-3 bg-gray-700/50 border border-gray-600 rounded-lg">
                              <p className="text-gray-200 text-xs font-semibold mb-3">Select Payment Method</p>
                              <div className="space-y-2">
                                <label className="flex items-center gap-3 p-2 bg-gray-800/50 rounded border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors">
                                  <input
                                    type="radio"
                                    name={`booked-payment-${hotel.id}`}
                                    value="wallet"
                                    checked={paymentMethod === "wallet"}
                                    onChange={() => setPaymentMethod("wallet")}
                                    className="w-4 h-4"
                                  />
                                  <div className="flex-1">
                                    <p className="text-white text-xs font-medium">💰 Wallet</p>
                                    <p className="text-gray-400 text-xs">Pay using your wallet balance</p>
                                  </div>
                                </label>

                                <label className="flex items-center gap-3 p-2 bg-gray-800/50 rounded border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors">
                                  <input
                                    type="radio"
                                    name={`booked-payment-${hotel.id}`}
                                    value="card"
                                    checked={paymentMethod === "card"}
                                    onChange={() => setPaymentMethod("card")}
                                    className="w-4 h-4"
                                  />
                                  <div className="flex-1">
                                    <p className="text-white text-xs font-medium">💳 Card</p>
                                    <p className="text-gray-400 text-xs">Pay using credit or debit card</p>
                                  </div>
                                </label>
                              </div>

                              <div className="mt-3 flex gap-2">
                                <button
                                  disabled={!paymentMethod || isProcessingPayment}
                                  onClick={() => onProceedPaymentClicked(hotel)}
                                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded font-medium transition-colors"
                                >
                                  {isProcessingPayment ? "Processing..." : "Proceed Payment"}
                                </button>
                                <button
                                  onClick={() => {
                                    setPayingId(null);
                                    setPaymentMethod(null);
                                  }}
                                  disabled={isProcessingPayment}
                                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-xs rounded font-medium transition-colors"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {upcomingHotels.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">
                📅 Upcoming Stays
              </h3>
              <div className="space-y-2">
                {upcomingHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 flex items-center justify-between hover:border-blue-600 transition-colors"
                  >
                    <div>
                      <p className="text-white font-medium">{hotel.hotel?.name || "Unknown Hotel"}</p>
                      <p className="text-gray-400 text-sm">
                        {hotel.hotel?.location?.name || "Unknown City"} • {new Date(hotel.checkInDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })} to {new Date(hotel.checkOutDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex flex-col text-right">
                        {hotel.paymentStatus === PaymentStatus.UNPAID && (
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-white font-semibold">৳ {hotel.totalPrice.toLocaleString()}</p>
                              <p className="text-gray-500 text-xs">Cash</p>
                            </div>
                            <div className="text-center">
                              <span className="inline-block px-2 py-1 bg-blue-600/30 text-blue-400 text-xs font-bold rounded border border-blue-600">OR</span>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">💳 {Math.floor(hotel.totalPrice * 0.8)}</p>
                              <p className="text-gray-500 text-xs">Credits</p>
                            </div>
                          </div>
                        )}
                        <div className="mt-2 flex gap-2">
                            {hotel.paymentStatus === PaymentStatus.PAID ? (
                            <span className="px-3 py-1 bg-green-600/30 text-green-400 text-xs rounded font-medium">
                                Paid
                            </span>
                            ) : (
                            <button 
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded font-medium transition-colors"
                                onClick={() => {
                                  setPayingId(payingId === hotel.id ? null : hotel.id);
                                  setPaymentMethod(null);
                                }}
                            >
                                Pay Now
                            </button>
                            )}
                            <button className={`px-3 py-1 text-white text-xs rounded font-medium transition-colors ${
                              hotel.paymentStatus === PaymentStatus.PAID
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-red-600 hover:bg-red-700"
                            }`}>
                                {hotel.paymentStatus === PaymentStatus.PAID ? "Cancel & Refund" : "Cancel Booking"}
                            </button>
                        </div>
                        
                        {payingId === hotel.id && (
                            <div className="mt-3 p-3 bg-gray-700/50 border border-gray-600 rounded-lg">
                              <p className="text-gray-200 text-xs font-semibold mb-3">Select Payment Method</p>
                              <div className="space-y-2">
                                <label className="flex items-center gap-3 p-2 bg-gray-800/50 rounded border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors">
                                  <input
                                    type="radio"
                                    name={`booked-payment-${hotel.id}`}
                                    value="wallet"
                                    checked={paymentMethod === "wallet"}
                                    onChange={() => setPaymentMethod("wallet")}
                                    className="w-4 h-4"
                                  />
                                  <div className="flex-1">
                                    <p className="text-white text-xs font-medium">💰 Wallet</p>
                                    <p className="text-gray-400 text-xs">Pay using your wallet balance</p>
                                  </div>
                                </label>

                                <label className="flex items-center gap-3 p-2 bg-gray-800/50 rounded border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors">
                                  <input
                                    type="radio"
                                    name={`booked-payment-${hotel.id}`}
                                    value="card"
                                    checked={paymentMethod === "card"}
                                    onChange={() => setPaymentMethod("card")}
                                    className="w-4 h-4"
                                  />
                                  <div className="flex-1">
                                    <p className="text-white text-xs font-medium">💳 Card</p>
                                    <p className="text-gray-400 text-xs">Pay using credit or debit card</p>
                                  </div>
                                </label>
                              </div>

                              <div className="mt-3 flex gap-2">
                                <button
                                  disabled={!paymentMethod || isProcessingPayment}
                                  onClick={() => onProceedPaymentClicked(hotel)}
                                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded font-medium transition-colors"
                                >
                                  {isProcessingPayment ? "Processing..." : "Proceed Payment"}
                                </button>
                                <button
                                  onClick={() => {
                                    setPayingId(null);
                                    setPaymentMethod(null);
                                  }}
                                  disabled={isProcessingPayment}
                                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white text-xs rounded font-medium transition-colors"
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
