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
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--theme-text)' }}>Booked Hotels</h2>
      {ongoingHotels.length === 0 && upcomingHotels.length === 0 ? (
        <div 
          className="border rounded-xl p-6 text-center"
          style={{
            backgroundColor: 'var(--theme-card-bg)',
            borderColor: 'var(--theme-deep-green)',
            color: 'var(--theme-text-subtle)'
          }}
        >
          No booked hotels
        </div>
      ) : (
        <div className="space-y-6">
          {ongoingHotels.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-teal)' }}>
                🔴 Current Stay
              </h3>
              <div className="space-y-2">
                {ongoingHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="border rounded-lg p-4 flex items-center justify-between transition-colors"
                    style={{
                      backgroundColor: 'var(--theme-card-bg)',
                      borderColor: 'var(--theme-deep-green)',
                    }}
                  >
                    <div>
                      <p className="font-medium" style={{ color: 'var(--theme-text)' }}>{hotel.hotel?.name || "Unknown Hotel"}</p>
                      <p className="text-sm" style={{ color: 'var(--theme-text-subtle)' }}>
                        {hotel.hotel?.location?.name || "Unknown City"} • {new Date(hotel.checkInDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })} to {new Date(hotel.checkOutDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex flex-col text-right">
                        {hotel.paymentStatus === PaymentStatus.UNPAID && (
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="font-semibold" style={{ color: 'var(--theme-text)' }}>৳ {hotel.totalPrice.toLocaleString()}</p>
                              <p className="text-xs" style={{ color: 'var(--theme-text-subtle)' }}>Cash</p>
                            </div>
                            <div className="text-center">
                              <span 
                                className="inline-block px-2 py-1 text-xs font-bold rounded border"
                                style={{
                                  backgroundColor: 'rgba(42, 157, 143, 0.2)',
                                  color: 'var(--theme-teal)',
                                  borderColor: 'var(--theme-teal)'
                                }}
                              >
                                OR
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold" style={{ color: 'var(--theme-text)' }}>💳 {Math.floor(hotel.totalPrice * 0.8)}</p>
                              <p className="text-xs" style={{ color: 'var(--theme-text-subtle)' }}>Credits</p>
                            </div>
                          </div>
                        )}
                        <div className="mt-2 flex gap-2">
                            {hotel.paymentStatus === PaymentStatus.PAID ? (
                            <span 
                              className="px-3 py-1 text-xs rounded font-medium"
                              style={{
                                backgroundColor: 'rgba(42, 157, 143, 0.2)',
                                color: 'var(--theme-teal)'
                              }}
                            >
                                Paid
                            </span>
                            ) : (
                            <button 
                                className="px-3 py-1 text-white text-xs rounded font-medium transition-colors hover:cursor-pointer"
                                style={{ backgroundColor: 'var(--theme-teal)' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-teal-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-teal)'}
                                onClick={() => {
                                  setPayingId(payingId === hotel.id ? null : hotel.id);
                                  setPaymentMethod(null);
                                }}
                            >
                                Pay Now
                            </button>
                            )}

                            <button 
                              className="px-3 py-1 text-white text-xs rounded font-medium transition-colors"
                              style={{
                                backgroundColor: hotel.paymentStatus === PaymentStatus.PAID ? 'var(--theme-teal)' : '#DC2626'
                              }}
                              onMouseEnter={(e) => {
                                if (hotel.paymentStatus === PaymentStatus.PAID) {
                                  e.currentTarget.style.backgroundColor = 'var(--theme-teal-hover)';
                                } else {
                                  e.currentTarget.style.backgroundColor = '#B91C1C';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (hotel.paymentStatus === PaymentStatus.PAID) {
                                  e.currentTarget.style.backgroundColor = 'var(--theme-teal)';
                                } else {
                                  e.currentTarget.style.backgroundColor = '#DC2626';
                                }
                              }}
                            >
                                {hotel.paymentStatus === PaymentStatus.PAID ? "Cancel & Refund" : "Cancel Booking"}
                            </button>
                        </div>

                        {payingId === hotel.id && (
                            <div 
                              className="mt-3 p-3 border rounded-lg"
                              style={{
                                backgroundColor: 'var(--theme-section-bg)',
                                borderColor: 'var(--theme-deep-green)'
                              }}
                            >
                              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--theme-text)' }}>Select Payment Method</p>
                              <div className="space-y-2">
                                <label 
                                  className="flex items-center gap-3 p-2 rounded border cursor-pointer transition-colors"
                                  style={{
                                    backgroundColor: 'var(--theme-card-bg)',
                                    borderColor: 'var(--theme-deep-green)'
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`booked-payment-${hotel.id}`}
                                    value="wallet"
                                    checked={paymentMethod === "wallet"}
                                    onChange={() => setPaymentMethod("wallet")}
                                    className="w-4 h-4"
                                  />
                                  <div className="flex-1">
                                    <p className="text-xs font-medium" style={{ color: 'var(--theme-text)' }}>💰 Wallet</p>
                                    <p className="text-xs" style={{ color: 'var(--theme-text-subtle)' }}>Pay using your wallet balance</p>
                                  </div>
                                </label>

                                <label 
                                  className="flex items-center gap-3 p-2 rounded border cursor-pointer transition-colors"
                                  style={{
                                    backgroundColor: 'var(--theme-card-bg)',
                                    borderColor: 'var(--theme-deep-green)'
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`booked-payment-${hotel.id}`}
                                    value="card"
                                    checked={paymentMethod === "card"}
                                    onChange={() => setPaymentMethod("card")}
                                    className="w-4 h-4"
                                  />
                                  <div className="flex-1">
                                    <p className="text-xs font-medium" style={{ color: 'var(--theme-text)' }}>💳 Card</p>
                                    <p className="text-xs" style={{ color: 'var(--theme-text-subtle)' }}>Pay using credit or debit card</p>
                                  </div>
                                </label>
                              </div>

                              <div className="mt-3 flex gap-2">
                                <button
                                  disabled={!paymentMethod || isProcessingPayment}
                                  onClick={() => onProceedPaymentClicked(hotel)}
                                  className="flex-1 px-3 py-2 text-white text-xs rounded font-medium transition-colors disabled:cursor-not-allowed"
                                  style={{
                                    backgroundColor: !paymentMethod || isProcessingPayment ? 'var(--theme-text-subtle)' : 'var(--theme-teal)'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!paymentMethod || isProcessingPayment) return;
                                    e.currentTarget.style.backgroundColor = 'var(--theme-teal-hover)';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!paymentMethod || isProcessingPayment) {
                                      e.currentTarget.style.backgroundColor = 'var(--theme-text-subtle)';
                                    } else {
                                      e.currentTarget.style.backgroundColor = 'var(--theme-teal)';
                                    }
                                  }}
                                >
                                  {isProcessingPayment ? "Processing..." : "Proceed Payment"}
                                </button>
                                <button
                                  onClick={() => {
                                    setPayingId(null);
                                    setPaymentMethod(null);
                                  }}
                                  disabled={isProcessingPayment}
                                  className="px-3 py-2 text-white text-xs rounded font-medium transition-colors disabled:cursor-not-allowed"
                                  style={{
                                    backgroundColor: isProcessingPayment ? 'var(--theme-text-subtle)' : 'var(--theme-deep-green)'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (isProcessingPayment) return;
                                    e.currentTarget.style.filter = 'brightness(1.2)';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (isProcessingPayment) {
                                      e.currentTarget.style.backgroundColor = 'var(--theme-text-subtle)';
                                    } else {
                                      e.currentTarget.style.backgroundColor = 'var(--theme-deep-green)';
                                    }
                                    e.currentTarget.style.filter = 'none';
                                  }}
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
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--theme-teal)' }}>
                📅 Upcoming Stays
              </h3>
              <div className="space-y-2">
                {upcomingHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="border rounded-lg p-4 flex items-center justify-between transition-colors"
                    style={{
                      backgroundColor: 'var(--theme-card-bg)',
                      borderColor: 'var(--theme-deep-green)'
                    }}
                  >
                    <div>
                      <p className="font-medium" style={{ color: 'var(--theme-text)' }}>{hotel.hotel?.name || "Unknown Hotel"}</p>
                      <p className="text-sm" style={{ color: 'var(--theme-text-subtle)' }}>
                        {hotel.hotel?.location?.name || "Unknown City"} • {new Date(hotel.checkInDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })} to {new Date(hotel.checkOutDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
                      </p>
                    </div>
                    <div className="flex flex-col text-right">
                        {hotel.paymentStatus === PaymentStatus.UNPAID && (
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="font-semibold" style={{ color: 'var(--theme-text)' }}>৳ {hotel.totalPrice.toLocaleString()}</p>
                              <p className="text-xs" style={{ color: 'var(--theme-text-subtle)' }}>Cash</p>
                            </div>
                            <div className="text-center">
                              <span 
                                className="inline-block px-2 py-1 text-xs font-bold rounded border"
                                style={{
                                  backgroundColor: 'rgba(42, 157, 143, 0.2)',
                                  color: 'var(--theme-teal)',
                                  borderColor: 'var(--theme-teal)'
                                }}
                              >
                                OR
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold" style={{ color: 'var(--theme-text)' }}>💳 {Math.floor(hotel.totalPrice * 0.8)}</p>
                              <p className="text-xs" style={{ color: 'var(--theme-text-subtle)' }}>Credits</p>
                            </div>
                          </div>
                        )}
                        <div className="mt-2 flex gap-2">
                            {hotel.paymentStatus === PaymentStatus.PAID ? (
                            <span 
                              className="px-3 py-1 text-xs rounded font-medium"
                              style={{
                                backgroundColor: 'rgba(42, 157, 143, 0.2)',
                                color: 'var(--theme-teal)'
                              }}
                            >
                                Paid
                            </span>
                            ) : (
                            <button 
                                className="px-3 py-1 text-white text-xs rounded font-medium transition-colors hover:cursor-pointer"
                                style={{ backgroundColor: 'var(--theme-teal)' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-teal-hover)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-teal)'}
                                onClick={() => {
                                  setPayingId(payingId === hotel.id ? null : hotel.id);
                                  setPaymentMethod(null);
                                }}
                            >
                                Pay Now
                            </button>
                            )}
                            <button 
                              className="px-3 py-1 text-white text-xs rounded font-medium transition-colors"
                              style={{
                                backgroundColor: hotel.paymentStatus === PaymentStatus.PAID ? 'var(--theme-teal)' : '#DC2626'
                              }}
                              onMouseEnter={(e) => {
                                if (hotel.paymentStatus === PaymentStatus.PAID) {
                                  e.currentTarget.style.backgroundColor = 'var(--theme-teal-hover)';
                                } else {
                                  e.currentTarget.style.backgroundColor = '#B91C1C';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (hotel.paymentStatus === PaymentStatus.PAID) {
                                  e.currentTarget.style.backgroundColor = 'var(--theme-teal)';
                                } else {
                                  e.currentTarget.style.backgroundColor = '#DC2626';
                                }
                              }}
                            >
                                {hotel.paymentStatus === PaymentStatus.PAID ? "Cancel & Refund" : "Cancel Booking"}
                            </button>
                        </div>
                        
                        {payingId === hotel.id && (
                            <div 
                              className="mt-3 p-3 border rounded-lg"
                              style={{
                                backgroundColor: 'var(--theme-section-bg)',
                                borderColor: 'var(--theme-deep-green)'
                              }}
                            >
                              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--theme-text)' }}>Select Payment Method</p>
                              <div className="space-y-2">
                                <label 
                                  className="flex items-center gap-3 p-2 rounded border cursor-pointer transition-colors"
                                  style={{
                                    backgroundColor: 'var(--theme-card-bg)',
                                    borderColor: 'var(--theme-deep-green)'
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`booked-payment-${hotel.id}`}
                                    value="wallet"
                                    checked={paymentMethod === "wallet"}
                                    onChange={() => setPaymentMethod("wallet")}
                                    className="w-4 h-4"
                                  />
                                  <div className="flex-1">
                                    <p className="text-xs font-medium" style={{ color: 'var(--theme-text)' }}>💰 Wallet</p>
                                    <p className="text-xs" style={{ color: 'var(--theme-text-subtle)' }}>Pay using your wallet balance</p>
                                  </div>
                                </label>

                                <label 
                                  className="flex items-center gap-3 p-2 rounded border cursor-pointer transition-colors"
                                  style={{
                                    backgroundColor: 'var(--theme-card-bg)',
                                    borderColor: 'var(--theme-deep-green)'
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`booked-payment-${hotel.id}`}
                                    value="card"
                                    checked={paymentMethod === "card"}
                                    onChange={() => setPaymentMethod("card")}
                                    className="w-4 h-4"
                                  />
                                  <div className="flex-1">
                                    <p className="text-xs font-medium" style={{ color: 'var(--theme-text)' }}>💳 Card</p>
                                    <p className="text-xs" style={{ color: 'var(--theme-text-subtle)' }}>Pay using credit or debit card</p>
                                  </div>
                                </label>
                              </div>

                              <div className="mt-3 flex gap-2">
                                <button
                                  disabled={!paymentMethod || isProcessingPayment}
                                  onClick={() => onProceedPaymentClicked(hotel)}
                                  className="flex-1 px-3 py-2 text-white text-xs rounded font-medium transition-colors disabled:cursor-not-allowed"
                                  style={{
                                    backgroundColor: !paymentMethod || isProcessingPayment ? 'var(--theme-text-subtle)' : 'var(--theme-teal)'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!paymentMethod || isProcessingPayment) return;
                                    e.currentTarget.style.backgroundColor = 'var(--theme-teal-hover)';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!paymentMethod || isProcessingPayment) {
                                      e.currentTarget.style.backgroundColor = 'var(--theme-text-subtle)';
                                    } else {
                                      e.currentTarget.style.backgroundColor = 'var(--theme-teal)';
                                    }
                                  }}
                                >
                                  {isProcessingPayment ? "Processing..." : "Proceed Payment"}
                                </button>
                                <button
                                  onClick={() => {
                                    setPayingId(null);
                                    setPaymentMethod(null);
                                  }}
                                  disabled={isProcessingPayment}
                                  className="px-3 py-2 text-white text-xs rounded font-medium transition-colors disabled:cursor-not-allowed"
                                  style={{
                                    backgroundColor: isProcessingPayment ? 'var(--theme-text-subtle)' : 'var(--theme-deep-green)'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (isProcessingPayment) return;
                                    e.currentTarget.style.filter = 'brightness(1.2)';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (isProcessingPayment) {
                                      e.currentTarget.style.backgroundColor = 'var(--theme-text-subtle)';
                                    } else {
                                      e.currentTarget.style.backgroundColor = 'var(--theme-deep-green)';
                                    }
                                    e.currentTarget.style.filter = 'none';
                                  }}
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
