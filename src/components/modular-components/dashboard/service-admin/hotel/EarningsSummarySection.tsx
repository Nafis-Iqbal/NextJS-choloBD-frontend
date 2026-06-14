"use client";

import { useMemo } from "react";
import { HotelBookingApi } from "@/services/api";
import { BookingStatus, PaymentStatus } from "@/types/enums";

// Earnings Summary Section
export const EarningsSummarySection = ({hotelId, className} : {hotelId: string; className?: string}) => {

  const { data: bookingsResponse, isLoading } = HotelBookingApi.useGetBookingsRQ(`hotelId=${hotelId}`);
  
  const bookings = useMemo(() => {
    const data = bookingsResponse?.data;
    if (Array.isArray(data)) {
      return data;
    }
    return data?.data || [];
  }, [bookingsResponse]);

  const { totalEarnings, pendingEarnings } = useMemo(() => {
    const completed = bookings
      .filter((b: HotelRoomBooking) => b.paymentStatus === PaymentStatus.PAID)
      .reduce((sum: number, b: HotelRoomBooking) => sum + b.totalPrice, 0);
    
    const pending = bookings
      .filter((b: HotelRoomBooking) => b.paymentStatus === PaymentStatus.UNPAID)
      .reduce((sum: number, b: HotelRoomBooking) => sum + b.totalPrice, 0);

    return { totalEarnings: completed, pendingEarnings: pending };
  }, [bookings]);

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.CONFIRMED:
        return { className: "px-3 py-1 rounded-full text-xs font-medium", style: { color: 'var(--theme-teal)', backgroundColor: 'rgba(42, 157, 143, 0.2)' } };
      case BookingStatus.PENDING:
        return { className: "px-3 py-1 rounded-full text-xs font-medium", style: { color: 'var(--theme-star)', backgroundColor: 'rgba(212, 160, 23, 0.2)' } };
      case BookingStatus.CANCELLED:
        return { className: "px-3 py-1 rounded-full text-xs font-medium text-red-400", style: { backgroundColor: 'rgba(239, 68, 68, 0.3)' } };
      default:
        return { className: "px-3 py-1 rounded-full text-xs font-medium theme-text-muted", style: { backgroundColor: 'var(--theme-card-bg)' } };
    }
  };

  const calculateNights = (checkIn: Date, checkOut: Date) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  if (isLoading) {
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-bold theme-text mb-6">Earnings Summary</h2>
        <p className="theme-text-subtle">Loading bookings...</p>
      </section>
    );
  }

  return (
    <section className={`mb-8 ${className}`}>
      <h2 className="text-2xl font-bold theme-text mb-6">Earnings Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="theme-card rounded-xl p-4">
          <p className="theme-text-muted text-sm">Total Completed</p>
          <p className="text-3xl font-bold theme-text-teal mt-2">
            ৳ {totalEarnings.toLocaleString()}
          </p>
        </div>
        <div className="theme-card rounded-xl p-4">
          <p className="theme-text-muted text-sm">Pending Amount</p>
          <p className="text-3xl font-bold mt-2" style={{ color: 'var(--theme-star)' }}>
            ৳ {pendingEarnings.toLocaleString()}
          </p>
        </div>
        <div className="theme-card rounded-xl p-4">
          <p className="theme-text-muted text-sm">Total Bookings</p>
          <p className="text-3xl font-bold theme-text-teal mt-2">{bookings.length}</p>
        </div>
      </div>

      <div className="theme-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-inherit" style={{ backgroundColor: 'var(--theme-section-bg)', borderBottom: '1px solid var(--theme-deep-green)' }}>
              <tr>
                <th className="px-6 py-3 theme-text font-semibold">Guest Name</th>
                <th className="px-6 py-3 theme-text font-semibold">Check-in</th>
                <th className="px-6 py-3 theme-text font-semibold">Check-out</th>
                <th className="px-6 py-3 theme-text font-semibold">Nights</th>
                <th className="px-6 py-3 theme-text font-semibold">Amount</th>
                <th className="px-6 py-3 theme-text font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking: HotelRoomBooking) => {
                  const nights = calculateNights(new Date(booking.checkInDate), new Date(booking.checkOutDate));
                  const checkInDate = new Date(booking.checkInDate).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: '2-digit' });
                  const checkOutDate = new Date(booking.checkOutDate).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: '2-digit' });
                  
                  return (
                    <tr
                      key={booking.id}
                      className="text-center" style={{ borderBottom: '1px solid var(--theme-deep-green)' }}
                    >
                      <td className="px-6 py-3 theme-text">{booking.user?.firstName || booking.guestName}</td>
                      <td className="px-6 py-3 theme-text-muted text-sm">{checkInDate}</td>
                      <td className="px-6 py-3 theme-text-muted text-sm">{checkOutDate}</td>
                      <td className="px-6 py-3 theme-text-muted">{nights}</td>
                      <td className="px-6 py-3 theme-text font-semibold">
                        ৳ {booking.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={getStatusColor(booking.status).className}
                          style={getStatusColor(booking.status).style}
                        >
                          {booking.status === BookingStatus.CONFIRMED
                            ? "✓ Confirmed"
                            : booking.status === BookingStatus.PENDING
                            ? "⏳ Pending"
                            : "✕ Cancelled"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center theme-text-subtle">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};