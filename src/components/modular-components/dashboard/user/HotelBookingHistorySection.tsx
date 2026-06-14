"use client";

import React, { useState, useMemo } from "react";
import { PaginationControls } from "./PaginationControls";
import { HotelBookingApi, PaymentApi, WalletApi } from "@/services/api";
import { queryClient } from "@/services/apiInstance";
import { ServiceType, PaymentStatus, BookingStatus } from "@/types/enums";
import { useGlobalUI } from "@/hooks/state-hooks/globalStateHooks";

// Booking Info Card Component
interface BookingInfoCardProps {
  booking: HotelRoomBooking;
  selectedBookingId: string | null;
  setSelectedBookingId: (id: string | null) => void;
  paymentMethod: "wallet" | "card" | null;
  setPaymentMethod: (method: "wallet" | "card" | null) => void;
  isProcessingPayment: boolean;
  cancellingBookingId: string | null;
  onProceedPaymentClicked: (booking: HotelRoomBooking) => void;
  onBookingCancelledClicked: (bookingId: string) => void;
  onCancelAndRefundClicked: (bookingId: string) => void;
}

// Hotel Booking History with Pagination
export const HotelBookingHistorySection: React.FC<{
  bookings?: HotelRoomBooking[];
  userId?: string;
  itemsPerPage?: number;
  className?: string;
}> = ({ bookings: propBookings, userId, itemsPerPage = 5, className }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "card" | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
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

  // Fetch hotel bookings if no bookings provided
  const { data: bookingsResponse, isLoading, refetch } = HotelBookingApi.useGetBookingsRQ(
    userId ? `userId=${userId}` : undefined
  );

  const { mutate: cancelBookingMutation } = HotelBookingApi.useCancelBookingRQ(
    (responseData) => {
      setCancellingBookingId(null);
      if (responseData.status === "success") {
        openNotificationPopUpMessage(responseData.message || "Booking cancelled");
        refetch();
      } else {
        openNotificationPopUpMessage(responseData.message || "Failed to cancel booking");
      }
    },
    () => {
      setCancellingBookingId(null);
      openNotificationPopUpMessage("Failed to cancel booking");
    }
  );

  // Transform API response to HotelRoomBooking format
  const bookings = useMemo(() => {
    if (propBookings && propBookings.length > 0) {
      return propBookings;
    }

    if (!bookingsResponse?.data) {
      return [];
    }

    // Handle both array and paginated responses
    const bookingList = Array.isArray(bookingsResponse.data) 
      ? bookingsResponse.data 
      : bookingsResponse.data.data || [];

    return bookingList;
  }, [propBookings, bookingsResponse?.data]);

  const onProceedPaymentClicked = (booking: HotelRoomBooking) => {
    if (!paymentMethod) return;
    
    setIsProcessingPayment(true);

    if (paymentMethod === "card") {
      // Initialize payment for card payment
      initializePaymentMutation({
        serviceType: ServiceType.HOTEL_BOOKING,
        serviceTypeId: booking.id,
        userId: userId,
        userName: booking.guestName || undefined,
        phone: booking.guestPhoneNumber || undefined,
        email: booking.guestEmail || undefined,
        paymentAmount: booking.totalPrice,
      });
    } else if (paymentMethod === "wallet") {
      // Charge wallet credits for wallet payment
      const creditsAmount = Math.floor(booking.totalPrice * 0.8);
      chargeWalletMutation({
        serviceType: ServiceType.HOTEL_BOOKING,
        serviceTypeId: booking.id,
        paymentAmount: creditsAmount,
      });
    }
  };

  const onBookingCancelledClicked = (bookingId: string) => {
    setCancellingBookingId(bookingId);
    setSelectedBookingId(null);
    setPaymentMethod(null);
    cancelBookingMutation(bookingId);
  }

  const onCancelAndRefundClicked = (bookingId: string) => {
    openNotificationPopUpMessage(
      "Cancel and refund feature coming soon"
    );
  }

  if (isLoading) {
    return (
      <section className={`mb-8 ${className || ''}`}>
        <h2 className="text-2xl font-bold theme-text mb-4">Hotel Booking History</h2>
        <div className="theme-card rounded-xl p-6 text-center theme-text-subtle">
          Loading bookings...
        </div>
      </section>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <section className={`mb-8 ${className || ''}`}>
        <h2 className="text-2xl font-bold theme-text mb-4">Hotel Booking History</h2>
        <div className="theme-card rounded-xl p-6 text-center theme-text-subtle">
          No hotel bookings found
        </div>
      </section>
    );
  }

  const totalPages = Math.ceil(bookings.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedData = bookings.slice(startIdx, startIdx + itemsPerPage);

  return (
    <section className={`mb-8 ${className || ''}`}>
      <h2 className="text-2xl font-bold theme-text mb-4">Hotel Booking History</h2>
      <div className="space-y-3">
        {paginatedData.map((booking) => (
          <div
            key={booking.id}
            className="theme-card rounded-lg p-4 hover:border-opacity-100 transition-colors"
            style={{ borderColor: 'var(--theme-teal)' }}
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
  onCancelAndRefundClicked
}) => {
  // Boolean flags for cleaner JSX
  const isBookingCancellable = 
    booking.status !== BookingStatus.CANCELLED && 
    booking.status !== BookingStatus.COMPLETED && 
    booking.status !== BookingStatus.REFUNDED && 
    booking.status !== BookingStatus.NO_SHOW;

  const isBookingInTerminalState = 
    booking.status === BookingStatus.CANCELLED || 
    booking.status === BookingStatus.REFUNDED || 
    booking.status === BookingStatus.NO_SHOW;

  // Determine payment status element
  const getPaymentStatusElement = () => {
    if (isBookingInTerminalState) {
      return null;
    }

    // Hide Pay Now button when payment options layout is open
    if (selectedBookingId === booking.id) {
      return null;
    }

    if (booking.paymentStatus === PaymentStatus.PAID) {
      return (
        <span className="px-3 py-1 text-xs rounded font-medium"
          style={{ 
            backgroundColor: 'var(--theme-teal)',
            color: 'white'
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
          className="px-3 py-1 text-white text-xs rounded font-medium transition-colors theme-btn-teal disabled:opacity-50 disabled:cursor-not-allowed"
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
      <span className="px-3 py-1 text-xs rounded font-medium theme-text-subtle"
        style={{ 
          backgroundColor: 'var(--theme-card-bg)',
        }}
      >
        {booking.paymentStatus || "Unknown"}
      </span>
    );
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div className="flex-1">
        <p className="font-semibold theme-text">{booking.hotel?.name || "Unknown Hotel"}</p>
        <p className="theme-text-subtle text-sm mt-1">
          📍 {booking.hotel?.location?.name || "Unknown City"} • {new Date(booking.checkInDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })} to {new Date(booking.checkOutDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
        </p>
      </div>
      <div className="mt-3 md:mt-0 flex items-center gap-3">
        <div className="text-right">
          {booking.paymentStatus === PaymentStatus.UNPAID && (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-semibold theme-text">৳ {booking.totalPrice.toLocaleString()}</p>
                <p className="theme-text-subtle text-xs">Cash</p>
              </div>
              <div className="text-center">
                <span className="inline-block px-2 py-1 text-xs font-bold rounded border" 
                  style={{ 
                    backgroundColor: 'var(--theme-section-bg)',
                    color: 'var(--theme-teal)',
                    borderColor: 'var(--theme-teal)'
                  }}
                >OR</span>
              </div>
              <div className="text-right">
                <p className="font-semibold theme-text">💳 {Math.floor(booking.totalPrice * 0.8)}</p>
                <p className="theme-text-subtle text-xs">Credits</p>
              </div>
            </div>
          )}

          <p className="theme-text-subtle text-xs mt-1">
            Status: {booking.status === BookingStatus.CONFIRMED ? (
              <span className="theme-text font-medium">✓ Confirmed</span>
            ) : booking.status === BookingStatus.PENDING ? (
              <span className="font-medium" style={{ color: 'var(--theme-star)' }}>⏳ Pending</span>
            ) : booking.status === BookingStatus.COMPLETED ? (
              <span className="font-medium" style={{ color: 'var(--theme-teal)' }}>✓ Completed</span>
            ) : booking.status === BookingStatus.CANCELLED ? (
              <span className="font-medium" style={{ color: 'var(--theme-red)' }}>✗ Cancelled</span>
            ) : booking.status === BookingStatus.REFUNDED ? (
              <span className="font-medium theme-text-muted">↩ Refunded</span>
            ) : booking.status === BookingStatus.NO_SHOW ? (
              <span className="theme-text-subtle font-medium">⊘ No Show</span>
            ) : (
              <span className="theme-text-subtle font-medium">{booking.status}</span>
            )}
          </p>

          <div className="mt-2 flex gap-2">
            {getPaymentStatusElement()}

            {isBookingCancellable && selectedBookingId !== booking.id && (
              <button
                disabled={cancellingBookingId === booking.id}
                onClick={() => 
                  booking.paymentStatus === PaymentStatus.PAID 
                    ? onCancelAndRefundClicked(booking.id)
                    : onBookingCancelledClicked(booking.id)
                }
                className="px-3 py-1 text-white text-xs rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: booking.paymentStatus === PaymentStatus.PAID 
                    ? 'var(--theme-teal)' 
                    : 'var(--theme-red, #dc2626)'
                }}
              >
                {cancellingBookingId === booking.id ? "Processing..." : 
                  booking.paymentStatus === PaymentStatus.PAID ? "Cancel & Refund" : "Cancel Booking"}
              </button>
            )}
            
          </div>
          
          {/* Payment method selection and processing */}
          {selectedBookingId === booking.id && (
            <div className="mt-3 p-3 theme-card rounded-lg">
              <p className="theme-text text-xs font-semibold mb-3">Select Payment Method</p>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-2 theme-input rounded cursor-pointer transition-colors"
                  style={{ borderColor: 'var(--theme-teal)' }}
                >
                  <input
                    type="radio"
                    name={`history-payment-${booking.id}`}
                    value="wallet"
                    checked={paymentMethod === "wallet"}
                    onChange={() => setPaymentMethod("wallet")}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="theme-text text-xs font-medium">💰 Wallet</p>
                    <p className="theme-text-subtle text-xs">Pay using your wallet balance</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2 theme-input rounded cursor-pointer transition-colors"
                  style={{ borderColor: 'var(--theme-teal)' }}
                >
                  <input
                    type="radio"
                    name={`history-payment-${booking.id}`}
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="theme-text text-xs font-medium">💳 Card</p>
                    <p className="theme-text-subtle text-xs">Pay using credit or debit card</p>
                  </div>
                </label>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  disabled={!paymentMethod || isProcessingPayment}
                  onClick={() => onProceedPaymentClicked(booking)}
                  className="flex-1 px-3 py-2 theme-btn-teal text-white text-xs rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessingPayment ? "Processing..." : "Proceed Payment"}
                </button>
                
                <button
                  onClick={() => {
                    setSelectedBookingId(null);
                    setPaymentMethod(null);
                  }}
                  disabled={isProcessingPayment}
                  className="px-3 py-2 text-xs rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed theme-text"
                  style={{ 
                    backgroundColor: 'var(--theme-card-bg)',
                    borderColor: 'var(--theme-deep-green)'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};